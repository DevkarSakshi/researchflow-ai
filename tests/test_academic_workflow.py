import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from agents.academic.analytics import AnalyticsAgent
from agents.academic.planner import PlannerAgent
from agents.academic.progress_tracker import ProgressTrackerAgent
from agents.academic.reminder import ReminderAgent
from agents.academic.workflow import AcademicWorkflow
from services import academic_service


class AcademicWorkflowTests(unittest.TestCase):
    def test_short_deadline_compresses_without_invalid_ranges(self):
        plan = PlannerAgent().create_plan(
            "A reproducible study",
            "2026-10-01",
            today="2026-09-30",
        )
        self.assertTrue(plan["schedule_risk"])
        for task in plan["tasks"]:
            self.assertLessEqual(task["start_date"], task["end_date"])
            self.assertLessEqual(task["end_date"], "2026-10-01")
        for milestone in plan["milestones"]:
            self.assertLessEqual(milestone["target_date"], "2026-10-01")

    def test_research_plan_content_drives_academic_tasks(self):
        result = AcademicWorkflow().build_from_research_plan(
            {
                "research_problem": "Does method A generalize?",
                "methodology": {
                    "steps": [{"title": "Evaluate on Dataset B", "description": "Use a held-out set."}],
                },
                "deliverables": ["Publish reproducibility report"],
            },
            "2026-10-10",
            today="2026-09-30",
        )
        self.assertEqual(
            [task["title"] for task in result["plan"]["tasks"]],
            ["Evaluate on Dataset B", "Publish reproducibility report"],
        )
        self.assertEqual(result["progress"]["total_tasks"], 2)
        self.assertEqual(result["analytics"]["total_tasks"], 2)
        self.assertEqual(result["plan"]["tasks"][0]["source_section"], "methodology")

    def test_progress_and_analytics_share_overdue_semantics(self):
        tasks = [
            {"id": "late", "title": "Late", "status": "pending", "start_date": "2026-09-01", "end_date": "2026-09-10", "priority": "high"},
            {"id": "active", "title": "Active", "status": "in_progress", "start_date": "2026-09-20", "end_date": "2026-10-05", "priority": "medium"},
            {"id": "done", "title": "Done", "status": "completed", "start_date": "2026-08-01", "end_date": "2026-09-01", "priority": "low"},
        ]
        progress = ProgressTrackerAgent().calculate_progress(tasks, today="2026-09-30")
        analytics = AnalyticsAgent().generate_analytics(tasks, today="2026-09-30")
        self.assertEqual(progress["pending_tasks"], analytics["pending_tasks"])
        self.assertEqual(progress["in_progress_tasks"], analytics["in_progress_tasks"])
        self.assertEqual(progress["overdue_tasks"], analytics["overdue_tasks"])
        self.assertEqual(progress["remaining_tasks"], 2)
        self.assertEqual(analytics["project_status"], "at_risk")

    def test_status_changes_recalculate_progress(self):
        tasks = [
            {"id": "a", "title": "A", "status": "pending", "end_date": "2026-10-10"},
            {"id": "b", "title": "B", "status": "in_progress", "end_date": "2026-10-12"},
        ]
        before = ProgressTrackerAgent().calculate_progress(tasks, today="2026-09-30")
        tasks[0]["status"] = "completed"
        after = ProgressTrackerAgent().calculate_progress(tasks, today="2026-09-30")
        self.assertEqual(before["progress_percentage"], 0)
        self.assertEqual(after["progress_percentage"], 50)

    def test_persisted_task_status_change_updates_academic_snapshot(self):
        project = {}
        tasks = []

        def create_project(project_data, task_data):
            project.update({**project_data, "id": "academic-project"})
            tasks.extend({**task, "id": task["id"], "project_id": project["id"]} for task in task_data)
            return dict(project)

        def update_status(_user_id, _project_id, task_id, status):
            task = next(item for item in tasks if item["id"] == task_id)
            task["status"] = status
            return dict(task)

        with (
            patch.object(academic_service.academic_repository, "create_academic_project", side_effect=create_project),
            patch.object(academic_service.academic_repository, "get_latest_academic_project", side_effect=lambda _user: dict(project) or None),
            patch.object(academic_service.academic_repository, "get_project_tasks", side_effect=lambda _user, _project: [dict(task) for task in tasks]),
            patch.object(academic_service.academic_repository, "update_project_task_status", side_effect=update_status),
        ):
            initial = academic_service.create_academic_workflow(
                "RF-test",
                "research-workflow",
                {
                    "research_problem": "Research question",
                    "methodology": {"steps": [{"title": "Run evaluation"}]},
                    "deliverables": ["Write report"],
                },
                "2026-10-10",
            )
            self.assertEqual(initial["progress"]["progress_percentage"], 0)
            academic_service.update_academic_task_status(
                "RF-test",
                initial["tasks"][0]["id"],
                "completed",
            )
            updated = academic_service.get_academic_state("RF-test")

        self.assertEqual(updated["progress"]["completed_tasks"], 1)
        self.assertEqual(updated["progress"]["progress_percentage"], 50)

    def test_reminders_cover_overdue_today_soon_and_upcoming(self):
        tasks = [
            {"id": "late", "title": "Late", "status": "pending", "end_date": "2026-09-29"},
            {"id": "today", "title": "Today", "status": "pending", "end_date": "2026-09-30"},
            {"id": "soon", "title": "Soon", "status": "in_progress", "end_date": "2026-10-02"},
            {"id": "upcoming", "title": "Upcoming", "status": "pending", "end_date": "2026-10-10"},
            {"id": "done", "title": "Done", "status": "completed", "end_date": "2026-09-29"},
        ]
        reminders = ReminderAgent().generate_reminders(tasks, today="2026-09-30")
        self.assertEqual({item["type"] for item in reminders}, {"overdue", "due_today", "due_soon", "upcoming"})
        self.assertNotIn("Done", {item["task"] for item in reminders})


if __name__ == "__main__":
    unittest.main()