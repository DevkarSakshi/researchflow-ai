import { useEffect, useState } from 'react';
import type { FinalResearchPlan, PersistedResearchWorkflow, ResearchAgent, ResearchWorkflowResult } from '../types';
import { agentService, getAgentsForWorkflow } from '../services/agentService';
import { request } from '../services/api';

const initialAgents = getAgentsForWorkflow(null);

export function useAgents() {
  const [agents, setAgents] = useState<ResearchAgent[]>(initialAgents);
  const [finalPlan, setFinalPlan] = useState<FinalResearchPlan | null>(null);
  const [workflowResult, setWorkflowResult] = useState<ResearchWorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    agentService.getLatestWorkflow()
      .then(async ({ workflow }) => {
        if (!active) return;
        setAgents(getAgentsForWorkflow(workflow));
        setWorkflowResult(workflow?.result ?? null);
        setError(workflow?.error ?? null);
        setFinalPlan(workflow?.result ? await agentService.getFinalPlan() : null);
      })
      .catch(loadError => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load research workflow.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    setLoading(true);
    try {
      const { workflow } = await agentService.getLatestWorkflow();
      applyWorkflow(workflow);
      setError(workflow?.error ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load research workflow.');
    } finally {
      setLoading(false);
    }
  }

  function applyWorkflow(workflow: PersistedResearchWorkflow | null) {
    setAgents(getAgentsForWorkflow(workflow));
    setWorkflowResult(workflow?.result ?? null);
    if (!workflow?.result) {
      setFinalPlan(null);
      return;
    }
    void agentService.getFinalPlan().then(setFinalPlan).catch(loadError => {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the final research plan.');
    });
  }

  async function runWorkflow(query: string, files: File[]) {
    setIsRunning(true);
    setError(null);
    setWorkflowResult(null);
    setFinalPlan(null);
    setAgents(initialAgents);
    const pollStatus = async () => {
      try {
        const { workflow } = await agentService.getLatestWorkflow();
        if (workflow) setAgents(getAgentsForWorkflow(workflow));
      } catch {
        // The start request remains the authoritative source of workflow errors.
      }
    };
    const pollTimer = window.setInterval(() => void pollStatus(), 750);

    try {
      const pdfs = await Promise.all(files.map(async file => {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
          reader.readAsDataURL(file);
        });

        return {
          filename: file.name,
          content_type: file.type || 'application/pdf',
          size_bytes: file.size,
          content_base64: dataUrl.split(',', 2)[1]
        };
      }));

      const response = await request<{ workflow: ResearchWorkflowResult & { workflow_id: string } }>('/research/start', {
        method: 'POST',
        body: JSON.stringify({ research_problem: query.trim(), pdfs })
      });
      const result = response.workflow;
      setWorkflowResult(result);
      applyWorkflow({
        id: result.workflow_id,
        research_problem: result.research_problem,
        pdfs: result.pdfs,
        status: result.status,
        approval_status: result.approval_status,
        agent_statuses: result.agent_statuses,
        result,
      });
    } catch (workflowError) {
      setError(workflowError instanceof Error ? workflowError.message : 'Research workflow failed.');
      await pollStatus();
    } finally {
      window.clearInterval(pollTimer);
      setIsRunning(false);
    }
  }

  async function approvePlan(
    decision: 'approved' | 'rejected' | 'changes_requested',
    notes?: string,
    deadline?: string,
  ) {
    await agentService.submitPlanApproval(decision, notes, deadline);
    await reload();
  }

  return {
    agents,
    finalPlan,
    workflowResult,
    error,
    isRunning,
    loading,
    runWorkflow,
    approvePlan,
    reload,
  };
}
