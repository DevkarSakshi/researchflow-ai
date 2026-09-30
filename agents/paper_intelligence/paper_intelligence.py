import json
import re
import time
from io import BytesIO

import requests
from pypdf import PdfReader
from google.genai import errors

from backend.core.gemini_client import client


class PaperIntelligenceAgent:

    def clean_text(self, text: str) -> str:
        """Clean extracted PDF/abstract text."""

        text = text or ""

        text = re.sub(r"<[^>]*>", " ", text)
        text = text.replace("\\<br\\>", " ")
        text = text.replace("\\n", " ")
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def extract_pdf_text(self, pdf_url: str) -> str:
        """
        Download a research paper PDF and extract readable text.
        Returns an empty string if PDF extraction fails.
        """

        if not pdf_url:
            return ""

        try:
            response = requests.get(
                pdf_url,
                headers={
                    "User-Agent": "ResearchFlow-AI/1.0"
                },
                timeout=30
            )

            response.raise_for_status()

            content_type = response.headers.get(
                "Content-Type",
                ""
            ).lower()

            # Basic validation that the response is likely a PDF.
            if (
                "pdf" not in content_type
                and not pdf_url.lower().split("?")[0].endswith(".pdf")
            ):
                return ""

            reader = PdfReader(
                BytesIO(response.content)
            )

            pages = []

            for page in reader.pages:
                try:
                    page_text = page.extract_text()

                    if page_text:
                        pages.append(page_text)

                except Exception:
                    continue

            text = "\n".join(pages)

            return self.clean_text(text)

        except (
            requests.RequestException,
            ValueError,
            OSError
        ):
            return ""

    def fallback_analysis(self, paper: dict) -> dict:
        """
        Extract basic paper intelligence directly from the
        available full-text PDF or abstract when Gemini is unavailable.
        """

        pdf_text = paper.get("_pdf_text", "") or ""
        abstract = paper.get("abstract", "") or ""

        text_source = pdf_text if pdf_text else abstract

        text_source = self.clean_text(text_source)

        if not text_source:
            return {
                "methodology": "Not available",
                "dataset": "Not available",
                "models_or_techniques": [],
                "results": "Not available",
                "key_findings": [],
                "limitations": "Not available"
            }

        text = text_source.lower()

        sentences = re.split(
            r"(?<=[.!?])\s+",
            text_source
        )

        # -----------------------------
        # Methodology
        # -----------------------------

        methodology_parts = []

        methodology_keywords = [
            "used",
            "trained",
            "developed",
            "propose",
            "proposed",
            "present",
            "framework",
            "model",
            "classification",
            "detection",
            "prediction",
            "bayesian",
            "deep learning",
            "machine learning",
            "preprocessing",
            "normalization",
            "smote",
            "architecture",
            "experiment",
            "experimental"
        ]

        for sentence in sentences:

            sentence_lower = sentence.lower()

            if any(
                keyword in sentence_lower
                for keyword in methodology_keywords
            ):
                methodology_parts.append(
                    sentence.strip()
                )

            if len(methodology_parts) >= 5:
                break

        methodology = (
            " ".join(methodology_parts)
            if methodology_parts
            else "Methodology information not clearly available."
        )

        # -----------------------------
        # Dataset
        # -----------------------------

        dataset = "Not available"

        known_dataset_patterns = [
            r"\bUCI Heart Disease dataset\b",
            r"\bUCI dataset\b",
            r"\bWESAD\b",
            r"\bMNIST\b",
            r"\bCIFAR-10\b",
            r"\bCIFAR-100\b",
            r"\bImageNet\b",
            r"\bKaggle\b",
            r"\bMIMIC[- ]III\b",
            r"\bMIMIC[- ]IV\b",
            r"\bPhysioNet\b",
            r"\bEyePACS\b",
            r"\bAPTOS\b",
            r"\bMessidor\b",
            r"\bDDR dataset\b"
        ]

        for pattern in known_dataset_patterns:

            dataset_match = re.search(
                pattern,
                text_source,
                re.IGNORECASE
            )

            if dataset_match:
                dataset = dataset_match.group(0)
                break

        # -----------------------------
        # Models / Techniques
        # -----------------------------

        technique_patterns = [
            "CNN",
            "LSTM",
            "Transformer",
            "EfficientNet",
            "DenseNet",
            "ViT",
            "XGBoost",
            "Random Forest",
            "Gradient Boosting",
            "Support Vector Machine",
            "SVM",
            "SHAP",
            "Grad-CAM",
            "Bayesian",
            "Llama",
            "LoRA",
            "BERT",
            "ResNet",
            "VGG",
            "MobileNet",
            "KNN",
            "Naive Bayes",
            "Logistic Regression",
            "deep learning",
            "machine learning",
            "artificial intelligence"
        ]

        models_or_techniques = []

        for technique in technique_patterns:

            if technique.lower() in text:
                models_or_techniques.append(
                    technique
                )

        models_or_techniques = list(
            dict.fromkeys(
                models_or_techniques
            )
        )

        # -----------------------------
        # Results
        # -----------------------------

        result_sentences = []

        result_keywords = [
            "accuracy",
            "sensitivity",
            "specificity",
            "auc",
            "results",
            "achieved",
            "performance",
            "precision",
            "recall",
            "f1-score",
            "f1 score",
            "outperformed",
            "improvement"
        ]

        for sentence in sentences:

            sentence_lower = sentence.lower()

            if any(
                keyword in sentence_lower
                for keyword in result_keywords
            ):
                result_sentences.append(
                    sentence.strip()
                )

            if len(result_sentences) >= 5:
                break

        results = (
            " ".join(result_sentences)
            if result_sentences
            else "Results information not clearly available."
        )

        # -----------------------------
        # Key Findings
        # -----------------------------

        finding_sentences = []

        finding_keywords = [
            "conclusion",
            "findings",
            "suggest",
            "demonstrates",
            "showed",
            "identified",
            "provides",
            "indicates",
            "reveals",
            "we found",
            "our findings"
        ]

        for sentence in sentences:

            sentence_lower = sentence.lower()

            if any(
                keyword in sentence_lower
                for keyword in finding_keywords
            ):
                finding_sentences.append(
                    sentence.strip()
                )

            if len(finding_sentences) >= 5:
                break

        key_findings = (
            finding_sentences
            if finding_sentences
            else [
                "Key findings extracted from the available paper text."
            ]
        )

        # -----------------------------
        # Limitations
        # -----------------------------

        limitation_sentences = []

        limitation_keywords = [
            "limitation",
            "limitations",
            "limited",
            "future work",
            "future research",
            "further research",
            "however",
            "challenge",
            "challenges",
            "constraint"
        ]

        for sentence in sentences:

            sentence_lower = sentence.lower()

            if any(
                keyword in sentence_lower
                for keyword in limitation_keywords
            ):
                limitation_sentences.append(
                    sentence.strip()
                )

            if len(limitation_sentences) >= 5:
                break

        limitations = (
            " ".join(limitation_sentences)
            if limitation_sentences
            else "Limitations not clearly available."
        )

        return {
            "methodology": methodology,
            "dataset": dataset,
            "models_or_techniques": models_or_techniques,
            "results": results,
            "key_findings": key_findings,
            "limitations": limitations
        }

    def analyze_paper(self, paper: dict) -> dict:

        title = paper.get(
            "title",
            ""
        )

        authors = paper.get(
            "authors",
            []
        )

        abstract = self.clean_text(
            paper.get(
                "abstract",
                ""
            )
        )

        pdf_url = paper.get(
            "pdf_url"
        )

        # --------------------------------
        # Try full-text PDF first
        # --------------------------------

        pdf_text = ""

        if pdf_url:
            pdf_text = self.extract_pdf_text(
                pdf_url
            )

        # --------------------------------
        # Decide analysis source
        # --------------------------------

        if pdf_text:

            analysis_text = pdf_text

            source_type = (
                "full-text PDF"
            )

        else:

            analysis_text = abstract

            source_type = (
                "abstract"
            )

        # Limit text sent to Gemini.
        # This prevents extremely large PDFs
        # from exceeding the model input limit.

        max_text_length = 30000

        analysis_text = analysis_text[
            :max_text_length
        ]

        if not analysis_text:

            return {
                "methodology": "Not available",
                "dataset": "Not available",
                "models_or_techniques": [],
                "results": "Not available",
                "key_findings": [],
                "limitations": "Not available",
                "analysis_source": source_type
            }

        prompt = f"""
You are the Paper Intelligence Agent of ResearchFlow AI.

Analyze the following academic research paper.

Title:
{title}

Authors:
{authors}

Analysis Source:
{source_type}

Paper Text:
{analysis_text}

Extract the following information strictly from the provided
paper text.

1. methodology:
Describe the actual research methodology, algorithms,
preprocessing, architecture, experimental setup, or approach.

2. dataset:
Give the exact dataset name or dataset names mentioned.
If multiple datasets are mentioned, list them in one string.
If no dataset name is explicitly mentioned, return:
"Not available".

3. models_or_techniques:
List the exact machine learning, deep learning,
statistical, NLP, AI, or explainability techniques mentioned.

4. results:
Extract reported performance metrics and important results,
including accuracy, precision, recall, F1-score, AUC,
sensitivity, specificity, improvement percentages, etc.

5. key_findings:
List the main findings or conclusions explicitly supported
by the paper text.

6. limitations:
Identify limitations, challenges, constraints, or future-work
directions explicitly mentioned by the paper.

Important rules:

- Do NOT invent information.
- Do NOT infer a dataset from the research topic.
- Do NOT infer limitations that are not supported by the text.
- Use exact dataset names when available.
- Distinguish reported results from general claims.
- If information is unavailable, return "Not available".
- Return ONLY valid JSON.

Use exactly this structure:

{{
    "methodology": "...",
    "dataset": "...",
    "models_or_techniques": ["..."],
    "results": "...",
    "key_findings": ["..."],
    "limitations": "..."
}}
"""

        max_retries = 2

        for attempt in range(max_retries):

            try:

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt,
                )

                response_text = (
                    response.text.strip()
                )

                if response_text.startswith("```"):

                    response_text = (
                        response_text
                        .replace(
                            "```json",
                            ""
                        )
                        .replace(
                            "```",
                            ""
                        )
                        .strip()
                    )

                analysis = json.loads(
                    response_text
                )

                if not isinstance(
                    analysis,
                    dict
                ):
                    raise ValueError(
                        "Gemini response is not a dictionary"
                    )

                # --------------------------------
                # Deterministic dataset extraction
                # --------------------------------

                dataset_patterns = [
                    r"\bUCI Heart Disease dataset\b",
                    r"\bUCI dataset\b",
                    r"\bWESAD\b",
                    r"\bMNIST\b",
                    r"\bCIFAR-10\b",
                    r"\bCIFAR-100\b",
                    r"\bImageNet\b",
                    r"\bKaggle\b",
                    r"\bMIMIC[- ]III\b",
                    r"\bMIMIC[- ]IV\b",
                    r"\bPhysioNet\b",
                    r"\bEyePACS\b",
                    r"\bAPTOS\b",
                    r"\bMessidor\b",
                    r"\bDDR dataset\b"
                ]

                for pattern in dataset_patterns:

                    dataset_match = re.search(
                        pattern,
                        analysis_text,
                        re.IGNORECASE
                    )

                    if dataset_match:

                        analysis["dataset"] = (
                            dataset_match.group(0)
                        )

                        break

                # --------------------------------
                # Add analysis source
                # --------------------------------

                analysis[
                    "analysis_source"
                ] = source_type

                return analysis

            except (
                errors.ServerError,
                errors.ClientError
            ):

                if (
                    attempt
                    == max_retries - 1
                ):

                    paper_with_text = {
                        **paper,
                        "_pdf_text": pdf_text
                    }

                    result = (
                        self.fallback_analysis(
                            paper_with_text
                        )
                    )

                    result[
                        "analysis_source"
                    ] = source_type

                    return result

                time.sleep(2)

            except (
                json.JSONDecodeError,
                ValueError
            ):

                paper_with_text = {
                    **paper,
                    "_pdf_text": pdf_text
                }

                result = (
                    self.fallback_analysis(
                        paper_with_text
                    )
                )

                result[
                    "analysis_source"
                ] = source_type

                return result