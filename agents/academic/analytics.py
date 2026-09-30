from datetime import date


class AnalyticsAgent:
    """
    Analytics Agent.

    Generates useful academic project statistics from tasks.
    This agent does not depend on Gemini or any external API.
    """

    def generate_analytics(
        self,
        tasks: list[dict],
        today: str | None = None,
        milestones: list[dict] | None = None,
    ) -> dict:
        """
        Generate project-level analytics.

        Each task should contain:
            task
            status
            start_date
            end_date
        """

        if today:
            try:
                current_date = date.fromisoformat(today)
            except ValueError:
                raise ValueError(
                    "Today must use YYYY-MM-DD format."
                )
        else:
            current_date = date.today()

        if not tasks:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "in_progress_tasks": 0,
                "overdue_tasks": 0,
                "completion_rate": 0,
                "overdue_rate": 0,
                "project_status": "not_started",
                "total_project_days": 0,
                "tasks_by_status": {},
                "tasks_by_priority": {},
                "completed_milestones": 0,
                "total_milestones": len(milestones or []),
            }

        completed = 0
        pending = 0
        in_progress = 0
        overdue = 0
        tasks_by_status = {}
        tasks_by_priority = {}

        start_dates = []
        end_dates = []

        for task in tasks:
            status = task.get("status", "pending").casefold()
            tasks_by_status[status] = tasks_by_status.get(status, 0) + 1
            priority = task.get("priority", "unspecified").casefold()
            tasks_by_priority[priority] = tasks_by_priority.get(priority, 0) + 1

            if status in {"completed", "done"}:
                completed += 1
            else:
                if status == "in_progress":
                    in_progress += 1
                else:
                    pending += 1

                # Overdue is an overlapping flag on incomplete work, not a task status.
                end_date_text = task.get("end_date")

                if end_date_text:
                    try:
                        end_date = date.fromisoformat(end_date_text)

                        if end_date < current_date:
                            overdue += 1

                    except ValueError:
                        pass

            start_date_text = task.get("start_date")
            end_date_text = task.get("end_date")

            if start_date_text:
                try:
                    start_dates.append(
                        date.fromisoformat(start_date_text)
                    )
                except ValueError:
                    pass

            if end_date_text:
                try:
                    end_dates.append(
                        date.fromisoformat(end_date_text)
                    )
                except ValueError:
                    pass

        total_tasks = len(tasks)

        completion_rate = round(
            (completed / total_tasks) * 100
        )

        overdue_rate = round(
            (overdue / total_tasks) * 100
        )

        if completed == total_tasks:
            project_status = "completed"
        elif overdue > 0:
            project_status = "at_risk"
        elif completed == 0 and in_progress == 0:
            project_status = "not_started"
        else:
            project_status = "in_progress"

        total_project_days = 0

        if start_dates and end_dates:
            project_start = min(start_dates)
            project_end = max(end_dates)

            total_project_days = (
                project_end - project_start
            ).days + 1

        milestone_list = milestones or []
        completed_milestones = sum(
            milestone.get("status") == "completed"
            or any(
                task.get("id") == milestone.get("task_id")
                and task.get("status", "").casefold() in {"completed", "done"}
                for task in tasks
            )
            for milestone in milestone_list
        )

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "overdue_tasks": overdue,
            "completion_rate": completion_rate,
            "overdue_rate": overdue_rate,
            "project_status": project_status,
            "total_project_days": total_project_days,
            "tasks_by_status": tasks_by_status,
            "tasks_by_priority": tasks_by_priority,
            "completed_milestones": completed_milestones,
            "total_milestones": len(milestone_list),
        }