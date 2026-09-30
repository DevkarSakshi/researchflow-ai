from agents.academic.planner import PlannerAgent
from agents.academic.reminder import ReminderAgent
from agents.academic.progress_tracker import ProgressTrackerAgent
from agents.academic.analytics import AnalyticsAgent


class AcademicWorkflow:
    """
    Coordinates the academic agents.

    The workflow can either:
    1. Create a new academic plan from a research topic, or
    2. Build academic tracking data from an existing
       final research plan.
    """

    def __init__(self):
        self.planner = PlannerAgent()
        self.reminder = ReminderAgent()
        self.progress_tracker = ProgressTrackerAgent()
        self.analytics = AnalyticsAgent()

    def create_academic_plan(
        self,
        research_topic: str,
        deadline: str,
        today: str | None = None,
    ) -> dict:
        """
        Create a new academic plan from a research topic.
        """

        plan = self.planner.create_plan(
            research_topic,
            deadline,
            today=today,
        )

        return self._build_academic_data(
            research_topic,
            deadline,
            plan,
            today,
        )

    def build_from_research_plan(
        self,
        final_research_plan: dict,
        deadline: str,
        today: str | None = None,
    ) -> dict:
        """
        Build academic tracking data from the existing
        final research plan produced by the research agents.
        """

        research_topic = (
            final_research_plan.get("research_problem")
            or next((
                paper.get("title")
                for paper in final_research_plan.get("paper_analysis", [])
                if paper.get("title") and paper.get("title") != "Not reported"
            ), None)
            or "Research project based on uploaded papers"
        )

        tasks = _tasks_from_research_plan(final_research_plan)
        plan = self.planner.create_plan(
            research_topic,
            deadline,
            tasks=tasks or None,
            today=today,
        )

        return self._build_academic_data(
            research_topic,
            deadline,
            plan,
            today,
            final_research_plan,
        )

    def _build_academic_data(
        self,
        research_topic: str,
        deadline: str,
        plan: dict,
        today: str | None,
        final_research_plan: dict | None = None,
    ) -> dict:
        """
        Run Reminder, Progress Tracker and Analytics
        on the same academic task list.
        """

        tasks = plan.get("tasks", [])
        milestones = plan.get("milestones", [])

        reminders = self.reminder.generate_reminders(
            tasks,
            today=today,
        )

        progress = self.progress_tracker.calculate_progress(
            tasks,
            today=today,
            milestones=milestones,
        )

        analytics = self.analytics.generate_analytics(
            tasks,
            today=today,
            milestones=milestones,
        )

        result = {
            "research_topic": research_topic,
            "deadline": deadline,
            "plan": plan,
            "reminders": reminders,
            "progress": progress,
            "analytics": analytics,
        }

        if final_research_plan is not None:
            result["research_plan"] = final_research_plan

        return result


def _tasks_from_research_plan(research_plan: dict) -> list[dict]:
    tasks = []

    for step in research_plan.get("methodology", {}).get("steps", []):
        title = step.get("title")
        if title:
            tasks.append({
                "title": title,
                "description": step.get("description", ""),
                "priority": "high",
                "source_section": "methodology",
                "reason": "Derived from the approved methodology step.",
            })

    for deliverable in research_plan.get("deliverables", []):
        title = deliverable.get("title") if isinstance(deliverable, dict) else str(deliverable)
        if title and title.strip():
            tasks.append({
                "title": title.strip(),
                "description": deliverable.get("description", "") if isinstance(deliverable, dict) else "",
                "priority": "medium",
                "source_section": "deliverables",
                "reason": "Derived from an approved research-plan deliverable.",
            })

    unique_tasks = []
    seen = set()
    for task in tasks:
        key = task["title"].casefold()
        if key not in seen:
            seen.add(key)
            unique_tasks.append(task)
    return unique_tasks