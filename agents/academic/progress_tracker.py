from datetime import date


class ProgressTrackerAgent:
    """
    Progress Tracker Agent.

    Calculates research progress from academic tasks.
    This agent does not depend on Gemini or any external API.
    """

    def calculate_progress(
        self,
        tasks: list[dict],
        today: str | None = None,
    ) -> dict:
        """
        Calculate overall academic project progress.

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
                "progress_percentage": 0,
                "current_task": None,
                "next_task": None,
            }

        completed_tasks = []
        pending_tasks = []
        overdue_tasks = []

        for task in tasks:
            status = task.get("status", "pending").lower()

            if status in {"completed", "done"}:
                completed_tasks.append(task)
                continue

            end_date_text = task.get("end_date")

            if end_date_text:
                try:
                    end_date = date.fromisoformat(end_date_text)

                    if end_date < current_date:
                        overdue_tasks.append(task)
                    else:
                        pending_tasks.append(task)

                except ValueError:
                    pending_tasks.append(task)
            else:
                pending_tasks.append(task)

        total_tasks = len(tasks)
        completed_count = len(completed_tasks)

        progress_percentage = round(
            (completed_count / total_tasks) * 100
        )

        # Find the first unfinished task by start date.
        unfinished_tasks = [
            task
            for task in tasks
            if task.get("status", "pending").lower()
            not in {"completed", "done"}
        ]

        unfinished_tasks.sort(
            key=lambda task: task.get(
                "start_date",
                "9999-12-31"
            )
        )

        current_task = None
        next_task = None

        if unfinished_tasks:
            current_task = unfinished_tasks[0].get("task")

        if len(unfinished_tasks) > 1:
            next_task = unfinished_tasks[1].get("task")

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_count,
            "pending_tasks": len(pending_tasks),
            "overdue_tasks": len(overdue_tasks),
            "progress_percentage": progress_percentage,
            "current_task": current_task,
            "next_task": next_task,
        }