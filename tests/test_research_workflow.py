import base64
import sys
import unittest
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
from fastapi.testclient import TestClient

from app.main import app
from agents.comparison.comparison import ComparisonAgent
from agents.gap.gap import GapAgent
from agents.literature.literature import LiteratureAgent
from agents.methodology.methodology import MethodologyAgent
from agents.paper_intelligence.paper_intelligence import PaperIntelligenceAgent
from agents.workflow import build_research_workflow, literature_agent
from backend.schemas.research import ResearchRequest, UploadedPDF
from backend.services.pdf_ingestion_service import PDFIngestionError, extract_uploaded_pdf
from core.security import get_current_researchflow_id
from services import research_service


def make_pdf() -> bytes:
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    writer.add_metadata({"/Title": "Testable Research Paper", "/Author": "Ada Author"})
    font = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica"),
    })
    page[NameObject("/Resources")] = DictionaryObject({
        NameObject("/Font"): DictionaryObject({NameObject("/F1"): font}),
    })
    stream = DecodedStreamObject()
    stream.set_data(
        b"BT /F1 12 Tf 72 720 Td (Testable Research Paper) Tj "
        b"0 -20 Td (Abstract) Tj "
        b"0 -20 Td (We evaluate a graph model on Dataset A and report 91% accuracy.) Tj "
        b"0 -20 Td (Limitations) Tj "
        b"0 -20 Td (The study has a small sample.) Tj "
        b"0 -20 Td (DOI 10.5555/test.2024) Tj ET"
    )
    page[NameObject("/Contents")] = stream
    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def uploaded_pdf(content: bytes | None = None) -> UploadedPDF:
    content = content or make_pdf()
    return UploadedPDF(
        filename="paper.pdf",
        content_type="application/pdf",
        size_bytes=len(content),
        content_base64=base64.b64encode(content).decode("ascii"),
    )


class PDFIngestionTests(unittest.TestCase):
    def test_extracts_page_text_metadata_and_doi(self):
        extracted = extract_uploaded_pdf(uploaded_pdf())
        self.assertEqual(extracted["page_count"], 1)
        self.assertEqual(extracted["metadata"]["title"], "Testable Research Paper")
        self.assertEqual(extracted["metadata"]["authors"], ["Ada Author"])
        self.assertEqual(extracted["metadata"]["doi"], "10.5555/test.2024")
        self.assertIn("Dataset A", extracted["page_texts"][0]["text"])

    def test_rejects_non_pdf_content(self):
        with self.assertRaises(PDFIngestionError):
            extract_uploaded_pdf(uploaded_pdf(b"not a pdf"))

    def test_request_schema_rejects_non_pdf_filename(self):
        payload = {
            "filename": "paper.txt",
            "content_type": "application/pdf",
            "size_bytes": 3,
            "content_base64": "YWJj",
        }
        with self.assertRaises(ValueError):
            ResearchRequest.model_validate({"pdfs": [payload]})


class ResearchAgentTests(unittest.TestCase):
    def test_paper_intelligence_is_deterministic_and_structured(self):
        extracted = extract_uploaded_pdf(uploaded_pdf())
        paper = {
            **extracted,
            "paper_id": "paper-one",
            "source_type": "uploaded_pdf",
        }
        analysis = PaperIntelligenceAgent().analyze_paper(paper)
        self.assertEqual(analysis["paper_id"], "paper-one")
        self.assertEqual(analysis["analysis_method"], "deterministic_pdf_and_metadata_extraction")
        self.assertIn("91%", analysis["evaluation_metrics"])
        self.assertTrue(analysis["evidence"])

    def test_comparison_matches_analysis_by_paper_identity(self):
        papers = [
            {"paper_id": "p1", "title": "Paper One"},
            {"paper_id": "p2", "title": "Paper Two"},
        ]
        analyses = [
            {"paper_id": "p2", "methodology": "Method Two"},
            {"paper_id": "p1", "methodology": "Method One"},
        ]
        rows = ComparisonAgent().compare_papers(papers, analyses)
        self.assertEqual(rows[0]["methodology"], "Method One")
        self.assertEqual(rows[1]["methodology"], "Method Two")

    def test_gaps_have_source_evidence_and_no_missing_field_placeholder(self):
        paper = {"paper_id": "p1", "title": "Paper One"}
        comparison = [{"paper_id": "p1", "dataset": "Not reported", "evaluation_metrics": []}]
        analysis = [{"paper_id": "p1", "evidence": [], "limitations": "Not reported"}]
        gaps = GapAgent().identify_gaps([paper], comparison, analysis)
        self.assertTrue(gaps)
        self.assertEqual(gaps[0]["source_paper_ids"], ["p1"])
        self.assertTrue(all("unavailable" not in gap["description"].casefold() for gap in gaps))

    def test_methodology_stays_pending_without_evidence(self):
        methodology = MethodologyAgent().suggest_methodology(
            "A user-supplied topic",
            [],
            [],
            [],
        )
        self.assertEqual(methodology["status"], "pending")
        self.assertEqual(methodology["steps"], [])

    def test_full_graph_passes_current_paper_data_and_status(self):
        literature_result = {
            "papers": [{
                "paper_id": "doi:10.5555/paper",
                "title": "Evaluation of a graph model",
                "authors": ["A. Author"],
                "year": 2024,
                "venue": "Journal",
                "doi": "10.5555/paper",
                "abstract": "We propose a graph model on Dataset A. Results report 91% accuracy. Limitations include small sample size.",
                "source": "Crossref",
            }],
            "sources": [{"name": "Crossref", "status": "completed"}],
        }
        status_events = []
        with patch.object(literature_agent, "search_literature_with_status", return_value=literature_result):
            result = build_research_workflow(
                lambda agent_id, status: status_events.append((agent_id, status))
            ).invoke({"research_problem": "Evaluate graph models", "pdfs": [], "agent_statuses": {}})

        self.assertEqual(result["comparison"][0]["paper_id"], "doi:10.5555/paper")
        self.assertTrue(result["research_gaps"])
        self.assertEqual(result["research_ideas"][0]["gap_id"], result["research_gaps"][0]["gap_id"])
        self.assertTrue(result["methodology"]["steps"])
        self.assertTrue(result["citations"][0]["bibtex"])
        self.assertEqual(result["reviewer_feedback"]["score"], None)
        self.assertTrue(all(status == "completed" for status in result["agent_statuses"].values()))
        self.assertTrue(any(status == "running" for _, status in status_events))

    def test_literature_failure_does_not_stop_deterministic_downstream(self):
        failed_sources = {
            "papers": [],
            "sources": [
                {"name": "Crossref", "status": "failed"},
                {"name": "Semantic Scholar", "status": "failed"},
            ],
        }
        with patch.object(literature_agent, "search_literature_with_status", return_value=failed_sources):
            result = build_research_workflow().invoke({
                "research_problem": "A research question",
                "pdfs": [],
                "agent_statuses": {},
            })
        self.assertEqual(result["agent_statuses"]["literature"], "failed")
        self.assertEqual(result["agent_statuses"]["comparison"], "completed")
        self.assertTrue(result["final_research_plan"])

    def test_service_persists_file_reference_and_structured_results(self):
        pdf_content = make_pdf()
        updates = []
        stored = []

        class FakeWorkflow:
            def invoke(self, state):
                self.state = state
                return {
                    **state,
                    "agent_statuses": {"orchestrator": "completed"},
                }

        fake_workflow = FakeWorkflow()
        with (
            patch.object(research_service, "save_research_workflow", return_value="workflow-1"),
            patch.object(research_service, "store_uploaded_paper", side_effect=lambda **kwargs: stored.append(kwargs) or "file-1"),
            patch.object(research_service, "update_research_workflow", side_effect=lambda _id, fields: updates.append(fields)),
            patch.object(research_service, "build_research_workflow", return_value=fake_workflow),
        ):
            result = research_service.create_research_workflow(
                "RF-test",
                "",
                [uploaded_pdf(pdf_content)],
            )

        self.assertEqual(stored[0]["content"], pdf_content)
        self.assertEqual(result["workflow_id"], "workflow-1")
        self.assertEqual(result["pdfs"][0]["paper_id"], "file-1")
        self.assertNotIn("content_base64", result["pdfs"][0])
        self.assertNotIn("page_texts", result["pdfs"][0])
        self.assertEqual(result["status"], "completed")
        self.assertTrue(any("result" in update for update in updates))

    def test_authenticated_research_start_route_accepts_real_pdf(self):
        content = make_pdf()
        updates = []

        class FakeWorkflow:
            def invoke(self, state):
                self.state = state
                return {
                    **state,
                    "agent_statuses": {"orchestrator": "completed"},
                }

        app.dependency_overrides[get_current_researchflow_id] = lambda: "RF-test"
        try:
            with (
                patch.object(research_service, "save_research_workflow", return_value="workflow-api"),
                patch.object(research_service, "store_uploaded_paper", return_value="stored-paper"),
                patch.object(research_service, "update_research_workflow", side_effect=lambda _id, fields: updates.append(fields)),
                patch.object(research_service, "build_research_workflow", return_value=FakeWorkflow()),
            ):
                response = TestClient(app).post(
                    "/research/start",
                    json={
                        "research_problem": "",
                        "pdfs": [{
                            "filename": "paper.pdf",
                            "content_type": "application/pdf",
                            "size_bytes": len(content),
                            "content_base64": base64.b64encode(content).decode("ascii"),
                        }],
                    },
                )
        finally:
            app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["workflow"]["workflow_id"], "workflow-api")
        self.assertEqual(response.json()["workflow"]["pdfs"][0]["paper_id"], "stored-paper")

    def test_research_start_route_rejects_non_pdf_upload(self):
        app.dependency_overrides[get_current_researchflow_id] = lambda: "RF-test"
        try:
            response = TestClient(app).post(
                "/research/start",
                json={
                    "research_problem": "",
                    "pdfs": [{
                        "filename": "paper.txt",
                        "content_type": "text/plain",
                        "size_bytes": 3,
                        "content_base64": "YWJj",
                    }],
                },
            )
        finally:
            app.dependency_overrides.clear()
        self.assertEqual(response.status_code, 422)

    def test_approval_rejects_past_deadline_before_persisting(self):
        completed_workflow = {
            "id": "workflow-1",
            "status": "completed",
            "result": {
                "paper_analysis": [{"paper_id": "paper-1"}],
                "final_research_plan": {"research_problem": "Question"},
            },
        }
        with (
            patch.object(research_service, "get_latest_workflow_by_user", return_value=completed_workflow),
            patch.object(research_service, "update_approval_status") as persist_approval,
        ):
            with self.assertRaisesRegex(ValueError, "cannot be in the past"):
                research_service.update_research_approval(
                    "RF-test",
                    "approved",
                    "2020-01-01",
                )
        persist_approval.assert_not_called()

    def test_approval_requires_analyzed_paper(self):
        completed_workflow = {
            "id": "workflow-1",
            "status": "completed",
            "result": {"paper_analysis": [], "final_research_plan": {"research_problem": "Question"}},
        }
        with (
            patch.object(research_service, "get_latest_workflow_by_user", return_value=completed_workflow),
            patch.object(research_service, "update_approval_status") as persist_approval,
        ):
            with self.assertRaisesRegex(ValueError, "analyzed paper"):
                research_service.update_research_approval(
                    "RF-test",
                    "approved",
                    "2026-10-10",
                )
        persist_approval.assert_not_called()


if __name__ == "__main__":
    unittest.main()