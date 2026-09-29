from datetime import date


class ReminderAgent:
    """
    Reminder Agent.

    Checks academic tasks and generates reminders based on
    their deadlines and completion status.

    This agent does not depend on Gemini or any external API.
    """

    def generate_reminders(
        self,
        tasks: list[dict],
        today: str | None = None,
        upcoming_days: int = 3,
    ) -> list[dict]:
        """
        Generate reminders for academic tasks.

        Args:
            tasks: List of task dictionaries containing:
                task, status, start_date, end_date.
            today: Optional date in YYYY-MM-DD format.
                   Defaults to the current date.
            upcoming_days: Number of days considered
                           "due soon".

        Returns:
            List of reminder dictionaries.
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

        if upcoming_days < 0:
            raise ValueError(
                "upcoming_days cannot be negative."
            )

        reminders = []

        for task in tasks:
            task_name = task.get("task", "Unnamed Task")
            status = task.get("status", "pending").lower()
            end_date_text = task.get("end_date")

            if not end_date_text:
                continue

            try:
                end_date = date.fromisoformat(end_date_text)
            except ValueError:
                continue

            # Completed tasks do not need reminders.
            if status in {"completed", "done"}:
                continue

            days_remaining = (end_date - current_date).days

            if days_remaining < 0:
                reminders.append(
                    {
                        "task": task_name,
                        "type": "overdue",
                        "message": (
                            f"{task_name} is overdue by "
                            f"{abs(days_remaining)} day(s)."
                        ),
                        "days_remaining": days_remaining,
                    }
                )

            elif days_remaining == 0:
                reminders.append(
                    {
                        "task": task_name,
                        "type": "due_today",
                        "message": (
                            f"{task_name} is due today."
                        ),
                        "days_remaining": 0,
                    }
                )

            elif days_remaining <= upcoming_days:
                reminders.append(
                    {
                        "task": task_name,
                        "type": "upcoming",
                        "message": (
                            f"{task_name} is due in "
                            f"{days_remaining} day(s)."
                        ),
                        "days_remaining": days_remaining,
                    }
                )

        return reminders