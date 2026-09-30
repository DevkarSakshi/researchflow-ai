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
        milestones: list[dict] | None = None,
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
                "in_progress_tasks": 0,
                "overdue_tasks": 0,
                "progress_percentage": 0,
                "current_task": None,
                "next_task": None,
                "remaining_tasks": 0,
                "completed_milestones": 0,
                "total_milestones": len(milestones or []),
            }

        completed_tasks = []
        pending_tasks = []
        in_progress_tasks = []
        overdue_tasks = []

        for task in tasks:
            status = task.get("status", "pending").casefold()

            if status in {"completed", "done"}:
                completed_tasks.append(task)
                continue

            if status == "in_progress":
                in_progress_tasks.append(task)
            else:
                pending_tasks.append(task)

            end_date_text = task.get("end_date")

            # Overdue is an overlapping flag on incomplete work, not a task status.
            if end_date_text:
                try:
                    end_date = date.fromisoformat(end_date_text)

                    if end_date < current_date:
                        overdue_tasks.append(task)
                except ValueError:
                    pass

        total_tasks = len(tasks)
        completed_count = len(completed_tasks)

        progress_percentage = round(
            (completed_count / total_tasks) * 100
        )

        # Find the first unfinished task by start date.
        unfinished_tasks = in_progress_tasks + pending_tasks

        unfinished_tasks.sort(
            key=lambda task: (task.get("start_date", "9999-12-31"), task.get("end_date", "9999-12-31"))
        )

        current_task = next(
            (task.get("title", task.get("task")) for task in in_progress_tasks),
            None,
        )
        next_task = None

        if current_task is None and unfinished_tasks:
            current_task = unfinished_tasks[0].get("task")

        next_candidates = [
            task for task in unfinished_tasks
            if task.get("title", task.get("task")) != current_task
        ]
        if next_candidates:
            next_task = next_candidates[0].get("title", next_candidates[0].get("task"))

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
            "completed_tasks": completed_count,
            "pending_tasks": len(pending_tasks),
            "in_progress_tasks": len(in_progress_tasks),
            "overdue_tasks": len(overdue_tasks),
            "progress_percentage": progress_percentage,
            "current_task": current_task,
            "next_task": next_task,
            "remaining_tasks": total_tasks - completed_count,
            "completed_milestones": completed_milestones,
            "total_milestones": len(milestone_list),
        }