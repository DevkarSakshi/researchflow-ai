import hashlib
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
        tasks: list[str | dict] | None = None,
        today: str | None = None,
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

        if today:
            try:
                current_date = date.fromisoformat(today)
            except ValueError as error:
                raise ValueError("Today must use YYYY-MM-DD format.") from error
        else:
            current_date = date.today()

        if deadline_date < current_date:
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

        total_days = (deadline_date - current_date).days
        schedule_days = total_days + 1
        task_count = len(tasks)

        scheduled_tasks = []

        for index, task in enumerate(tasks):
            task_data = {"title": task} if isinstance(task, str) else dict(task)
            title = str(task_data.get("title") or task_data.get("task") or "Untitled task").strip()
            start_offset = index * schedule_days // task_count
            end_offset = max(start_offset, (index + 1) * schedule_days // task_count - 1)
            start_offset = min(start_offset, schedule_days - 1)
            end_offset = min(end_offset, schedule_days - 1)
            start_date = current_date + timedelta(days=start_offset)
            end_date = current_date + timedelta(days=end_offset)
            stable_id = hashlib.sha256(
                f"{index}:{title.casefold()}".encode("utf-8")
            ).hexdigest()[:16]
            scheduled_tasks.append(
                {
                    "id": stable_id,
                    "title": title,
                    "description": task_data.get("description", ""),
                    "status": task_data.get("status", "pending"),
                    "priority": task_data.get("priority", "medium"),
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "dependencies": task_data.get("dependencies", []),
                    "source_section": task_data.get("source_section"),
                    "reason": task_data.get("reason", ""),
                    "task": title,
                }
            )

        milestones = [
            {
                "id": f"milestone:{task['id']}",
                "name": task["title"],
                "target_date": task["end_date"],
                "task_id": task["id"],
            }
            for task in scheduled_tasks
        ]

        return {
            "research_topic": research_topic,
            "created_date": current_date.isoformat(),
            "deadline": deadline_date.isoformat(),
            "total_days": total_days,
            "schedule_risk": task_count > schedule_days,
            "tasks": scheduled_tasks,
            "milestones": milestones,
        }