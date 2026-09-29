import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class OrchestratorAgent:
    """
    Coordinates the research workflow by analyzing
    the student's research problem and creating tasks
    for specialized research agents.
    """

    def create_tasks(self, research_problem: str) -> list[str]:
        """
        Analyze the research problem and generate
        suitable research tasks using Gemini.
        """

        prompt = f"""
You are the Orchestrator Agent of ResearchFlow AI.

Your job is to analyze a student's research problem
and create a sequence of research tasks for specialized
AI agents.

Research problem:
{research_problem}

Create tasks for these specialized agents when relevant:
- Literature Agent
- Paper Intelligence Agent
- Comparison Agent
- Gap Agent
- Idea Agent
- Methodology Agent
- Citation Agent
- Reviewer Agent

Return ONLY a JSON array of task names.
Do not include markdown or explanations.

Example:
[
    "Find relevant research literature",
    "Analyze important research papers",
    "Compare existing approaches",
    "Identify research gaps",
    "Generate possible research ideas",
    "Suggest research methodology",
    "Organize citations",
    "Review the research plan"
]
"""

        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=prompt,
                )

                tasks = json.loads(response.text)

                if isinstance(tasks, list):
                    return tasks

                raise ValueError(
                    "Gemini response is not a task list"
                )

            except (errors.ServerError, errors.ClientError) as error:
                if attempt == max_retries - 1:
                    return [
                        "Find relevant research literature",
                        "Analyze important research papers",
                        "Compare existing approaches",
                        "Identify research gaps",
                        "Generate possible research ideas",
                        "Suggest research methodology",
                        "Organize citations",
                        "Review the research plan",
                    ]

                time.sleep(3)

            except (json.JSONDecodeError, ValueError):
                raise ValueError(
                    "Orchestrator received an invalid response from Gemini"
                )