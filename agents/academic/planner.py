from datetime import date, timedelta


class PlannerAgent:
    """
    Academic Planner Agent.

    Creates a structured research/project plan from
    a project topic, deadline, and list of tasks.

    This agent does not depend on an external AI API.
    """

    def create_plan(
        self,
        research_topic: str,
        deadline: str,
        tasks: list[str] | None = None,
    ) -> dict:
        """
        Create an academic project schedule.

        Args:
            research_topic: Name/topic of the research project.
            deadline: Final project deadline in YYYY-MM-DD format.
            tasks: Optional list of academic tasks.

        Returns:
            Dictionary containing project phases,
            scheduled tasks, milestones, and deadline.
        """

        if not research_topic.strip():
            raise ValueError("Research topic cannot be empty.")

        try:
            deadline_date = date.fromisoformat(deadline)
        except ValueError:
            raise ValueError(
                "Deadline must use YYYY-MM-DD format."
            )

        today = date.today()

        if deadline_date < today:
            raise ValueError(
                "Project deadline cannot be in the past."
            )

        if not tasks:
            tasks = [
                "Literature Review",
                "Problem Definition",
                "Methodology Design",
                "Implementation",
                "Testing and Evaluation",
                "Documentation",
                "Final Review",
            ]

        total_days = (deadline_date - today).days

        # Keep at least one day for each task.
        days_per_task = max(1, total_days // len(tasks))

        scheduled_tasks = []

        for index, task in enumerate(tasks):
            start_date = today + timedelta(
                days=index * days_per_task
            )

            if index == len(tasks) - 1:
                end_date = deadline_date
            else:
                end_date = min(
                    deadline_date,
                    today + timedelta(
                        days=(index + 1) * days_per_task - 1
                    ),
                )

            scheduled_tasks.append(
                {
                    "task": task,
                    "status": "pending",
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                }
            )

        milestones = [
            {
                "name": "Research Planning Completed",
                "target_date": scheduled_tasks[0]["end_date"],
            },
            {
                "name": "Implementation Completed",
                "target_date": (
                    scheduled_tasks[
                        min(3, len(scheduled_tasks) - 1)
                    ]["end_date"]
                ),
            },
            {
                "name": "Final Submission",
                "target_date": deadline_date.isoformat(),
            },
        ]

        return {
            "research_topic": research_topic,
            "created_date": today.isoformat(),
            "deadline": deadline_date.isoformat(),
            "total_days": total_days,
            "tasks": scheduled_tasks,
            "milestones": milestones,
        }