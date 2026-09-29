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
                "overdue_tasks": 0,
                "completion_rate": 0,
                "overdue_rate": 0,
                "project_status": "not_started",
                "total_project_days": 0,
            }

        completed = 0
        pending = 0
        overdue = 0

        start_dates = []
        end_dates = []

        for task in tasks:
            status = task.get("status", "pending").lower()

            if status in {"completed", "done"}:
                completed += 1
            else:
                pending += 1

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

        if completed == 0:
            project_status = "not_started"
        elif completed == total_tasks:
            project_status = "completed"
        elif overdue > 0:
            project_status = "at_risk"
        else:
            project_status = "in_progress"

        total_project_days = 0

        if start_dates and end_dates:
            project_start = min(start_dates)
            project_end = max(end_dates)

            total_project_days = (
                project_end - project_start
            ).days + 1

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "overdue_tasks": overdue,
            "completion_rate": completion_rate,
            "overdue_rate": overdue_rate,
            "project_status": project_status,
            "total_project_days": total_project_days,
        }