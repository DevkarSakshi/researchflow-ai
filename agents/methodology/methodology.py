import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class MethodologyAgent:
    """
    Methodology Agent responsible for generating
    a structured and academically realistic research
    methodology for the proposed research direction.
    """

    def suggest_methodology(
        self,
        research_problem: str,
        research_ideas: list[dict]
    ) -> dict:

        # Even if Idea Agent does not return an idea,
        # methodology can still be generated from the research problem.
        if not research_ideas:
            research_ideas = [{
                "title": "Research Methodology for the Proposed Problem",
                "core_hypothesis": (
                    "A suitable machine learning or deep learning "
                    "approach can be developed and evaluated for "
                    "the given research problem."
                ),
                "architecture": (
                    "Data collection → preprocessing → baseline models "
                    "→ proposed model → training → evaluation → explainability"
                ),
                "rationale": (
                    "The methodology is derived directly from the "
                    "identified research problem."
                )
            }]

        prompt = f"""
You are the Methodology Agent of ResearchFlow AI.

Design a structured, realistic and academically appropriate
research methodology for the following research problem.

Research problem:
{research_problem}

Research direction:
{json.dumps(research_ideas, indent=2)}

IMPORTANT RULES:

1. Base the methodology directly on the research problem.

2. If a research idea is available, use it to refine the methodology.

3. If the research idea is unavailable or incomplete, generate
   the methodology directly from the research problem.

4. Do NOT invent experimental results.

5. Do NOT claim that the proposed method is already proven.

6. Define a clear and specific research objective.

7. Define a realistic data collection strategy and mention
   suitable publicly available datasets when appropriate.

8. Define preprocessing steps relevant to the research problem.

9. Include suitable baseline models for comparison.

10. Define a clear proposed approach.

11. Include a realistic training strategy.

12. Include appropriate evaluation metrics.

13. Include explainability or interpretability techniques
    when relevant to the research problem.

14. Define an expected outcome without guaranteeing improvement.

15. Keep the methodology suitable for a final-year academic
    research project.

16. Do not use "Not available" for any field.

17. Return ONLY valid JSON.

Return exactly:

{{
    "problem_definition": "...",
    "research_objective": "...",
    "data_collection": "...",
    "preprocessing": "...",
    "baseline_models": "...",
    "proposed_approach": "...",
    "training_strategy": "...",
    "evaluation": "...",
    "explainability": "...",
    "expected_outcome": "..."
}}
"""

        for attempt in range(2):

            try:

                print(">>> METHODOLOGY AGENT CALLED <<<")

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt,
                )

                response_text = response.text.strip()

                if response_text.startswith("```"):
                    response_text = (
                        response_text
                        .replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )

                methodology = json.loads(response_text)

                if not isinstance(methodology, dict):
                    raise ValueError(
                        "Invalid methodology response"
                    )

                required_fields = [
                    "problem_definition",
                    "research_objective",
                    "data_collection",
                    "preprocessing",
                    "baseline_models",
                    "proposed_approach",
                    "training_strategy",
                    "evaluation",
                    "explainability",
                    "expected_outcome"
                ]

                # If Gemini gives an empty/missing field,
                # use the academic fallback instead.
                fallback = self.fallback_methodology(
                    research_problem,
                    research_ideas
                )

                for field in required_fields:

                    if (
                        field not in methodology
                        or not methodology[field]
                        or str(methodology[field]).strip()
                        == "Not available"
                    ):
                        methodology[field] = fallback[field]

                return methodology

            except (
                errors.ServerError,
                errors.ClientError
            ):

                print(
                    ">>> GEMINI METHODOLOGY GENERATION FAILED <<<"
                )

                if attempt == 1:
                    return self.fallback_methodology(
                        research_problem,
                        research_ideas
                    )

                time.sleep(2)

            except (
                json.JSONDecodeError,
                ValueError,
                AttributeError
            ):

                print(
                    ">>> INVALID GEMINI METHODOLOGY RESPONSE <<<"
                )

                return self.fallback_methodology(
                    research_problem,
                    research_ideas
                )

        return self.fallback_methodology(
            research_problem,
            research_ideas
        )

    def fallback_methodology(
        self,
        research_problem: str,
        research_ideas: list[dict]
    ) -> dict:

        idea = research_ideas[0] if research_ideas else {}

        problem_lower = research_problem.lower()

        # Specific academic methodology for diabetic retinopathy
        if (
            "diabetic retinopathy" in problem_lower
            or "retinopathy" in problem_lower
        ):

            return {
                "problem_definition": research_problem,

                "research_objective": (
                    "Develop a machine learning or deep learning "
                    "approach for early detection and classification "
                    "of diabetic retinopathy from retinal fundus images."
                ),

                "data_collection": (
                    "Use publicly available retinal image datasets "
                    "such as EyePACS, APTOS or Messidor, subject to "
                    "dataset availability and project scope. The images "
                    "should contain appropriate diabetic retinopathy "
                    "severity labels."
                ),

                "preprocessing": (
                    "Resize retinal fundus images to a fixed input size, "
                    "normalize pixel values, remove or reduce image "
                    "artifacts where required, and apply suitable data "
                    "augmentation techniques such as rotation, flipping "
                    "and brightness adjustment. Split the dataset into "
                    "training, validation and testing subsets."
                ),

                "baseline_models": (
                    "Use established image classification approaches "
                    "such as ResNet, EfficientNet or a conventional "
                    "CNN as baseline models for comparison."
                ),

                "proposed_approach": (
                    idea.get(
                        "architecture",
                        "Develop a deep learning based retinal image "
                        "classification model for detecting diabetic "
                        "retinopathy at an early stage, followed by "
                        "model explainability using visual attribution "
                        "methods."
                    )
                ),

                "training_strategy": (
                    "Train the selected deep learning models using the "
                    "training dataset with transfer learning where "
                    "appropriate. Use validation data for hyperparameter "
                    "tuning and apply class balancing or weighted loss "
                    "when class imbalance is present. Keep the test "
                    "dataset separate for final evaluation."
                ),

                "evaluation": (
                    "Evaluate the models using accuracy, precision, "
                    "recall, F1-score, sensitivity, specificity and "
                    "ROC-AUC. Use a confusion matrix to analyse "
                    "classification performance across disease classes."
                ),

                "explainability": (
                    "Apply explainable AI techniques such as Grad-CAM "
                    "to highlight retinal regions contributing to the "
                    "model prediction and improve interpretability of "
                    "the automated detection system."
                ),

                "expected_outcome": (
                    "The study is expected to determine the feasibility "
                    "of using deep learning for early diabetic retinopathy "
                    "detection and to identify the model and configuration "
                    "that provide suitable performance on the selected "
                    "dataset without assuming a guaranteed improvement."
                )
            }

        # General fallback for other research problems
        return {
            "problem_definition": research_problem,

            "research_objective": (
                "Develop and evaluate a machine learning or deep "
                "learning based approach that addresses the identified "
                "research problem."
            ),

            "data_collection": (
                "Identify and collect a suitable publicly available "
                "dataset relevant to the research problem. Ensure that "
                "the dataset contains sufficient samples and appropriate "
                "labels or target variables."
            ),

            "preprocessing": (
                "Clean the collected data, handle missing or noisy "
                "values, perform suitable normalization or transformation, "
                "encode categorical variables where required, and divide "
                "the dataset into training, validation and testing sets."
            ),

            "baseline_models": (
                "Implement suitable established machine learning or "
                "deep learning models as baseline approaches for "
                "comparison with the proposed method."
            ),

            "proposed_approach": (
                idea.get(
                    "architecture",
                    "Develop a suitable machine learning or deep "
                    "learning architecture based on the characteristics "
                    "of the research problem."
                )
            ),

            "training_strategy": (
                "Train the selected models using an appropriate "
                "train-validation-test strategy. Tune important "
                "hyperparameters using validation data and apply "
                "regularization or class balancing when required."
            ),

            "evaluation": (
                "Evaluate the proposed approach using suitable metrics "
                "such as accuracy, precision, recall, F1-score, ROC-AUC "
                "or other task-specific evaluation measures."
            ),

            "explainability": (
                "Apply appropriate explainable AI or interpretability "
                "techniques to analyse model predictions and understand "
                "the important factors contributing to the results."
            ),

            "expected_outcome": (
                "Determine the feasibility and effectiveness of the "
                "proposed approach through experimental evaluation and "
                "comparison with the selected baseline methods."
            )
        }