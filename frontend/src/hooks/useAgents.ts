import { useState, useEffect } from 'react';
import type { ResearchAgent, FinalResearchPlan } from '../types';
import { agentService } from '../services/agentService';
import { request } from '../services/api';

export function useAgents() {
  const [agents, setAgents] = useState<ResearchAgent[]>([]);
  const [finalPlan, setFinalPlan] =
    useState<FinalResearchPlan | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const agentNames = [
    'Orchestrator',
    'Literature Agent',
    'Paper Intelligence Agent',
    'Comparison Agent',
    'Gap Agent',
    'Idea Agent',
    'Methodology Agent',
    'Citation Agent',
    'Reviewer Agent',
  ];

  function createAgents(
    workflow: any,
    completed: boolean
  ): ResearchAgent[] {
    return agentNames.map((agentName, index) => {
      let summary = `${agentName} is pending.`;

      if (completed) {
        if (agentName === 'Orchestrator') {
          summary = `Generated ${
            workflow.tasks?.length ?? 0
          } research tasks from the research problem.`;
        } else if (agentName === 'Literature Agent') {
          summary = `Retrieved ${
            workflow.papers?.length ?? 0
          } research papers for analysis.`;
        } else if (agentName === 'Paper Intelligence Agent') {
          summary = `Analyzed ${
            workflow.paper_analysis?.length ?? 0
          } research paper(s) for methodology, datasets, techniques and results.`;
        } else if (agentName === 'Comparison Agent') {
          summary = `Generated a comparison of ${
            workflow.comparison?.length ?? 0
          } research papers.`;
        } else if (agentName === 'Gap Agent') {
          summary = `Identified ${
            workflow.research_gaps?.length ?? 0
          } research gaps from the available literature analysis.`;
        } else if (agentName === 'Idea Agent') {
          summary = `Generated ${
            workflow.research_ideas?.length ?? 0
          } possible research ideas.`;
        } else if (agentName === 'Methodology Agent') {
          summary =
            'Generated a research methodology covering problem definition, data collection, preprocessing, model development and evaluation.';
        } else if (agentName === 'Citation Agent') {
          summary = `Organized ${
            workflow.citations?.length ?? 0
          } research paper citations.`;
        } else if (agentName === 'Reviewer Agent') {
          summary =
            workflow.reviewer_feedback ||
            'Research plan reviewed successfully.';
        }
      }

      return {
        id: agentName
          .toLowerCase()
          .replace(' agent', '')
          .replace(/\s+/g, '_') as any,

        name: agentName,
        role: agentName,
        order: index + 1,

        status: completed
          ? 'completed'
          : 'pending',

        progress: completed ? 100 : 0,

        lastUpdated: new Date().toISOString(),

        summaryOutput: summary,
      };
    });
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);

    try {
      const response = await request<any>(
        '/research/latest',
        {
          method: 'GET',
        }
      );

      const workflow =
        response.workflow ?? response;

      setAgents(
        createAgents(workflow, true)
      );

      const plan =
        workflow.final_research_plan;

      if (plan) {
        setFinalPlan({
          projectId: 'researchflow',

          topic:
            plan.research_problem,

          generatedDate:
            new Date().toLocaleDateString(),

          problemStatement:
            plan.research_problem,

          novelHypothesis:
            (plan.research_ideas ?? []).join(
              '\n'
            ),

          methodologySummary:
            typeof plan.methodology === 'object'
              ? Object.values(
                  plan.methodology
                ).join('\n')
              : String(
                  plan.methodology ?? ''
                ),

          datasets: [],
          deliverables: [],
          risksAndMitigations: [],

          humanApprovalStatus:
            plan.approval_status === 'approved'
              ? 'approved'
              : plan.approval_status === 'rejected'
              ? 'rejected'
              : plan.approval_status ===
                'changes_requested'
              ? 'changes_requested'
              : 'pending_review',
        });
      }
    } catch (error) {
      console.error(
        'Failed to load latest research workflow:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function runWorkflowSimulation(
    query: string
  ) {
    setIsRunning(true);

    setAgents(
  agentNames.map((agentName, index) => ({
    id: agentName
      .toLowerCase()
      .replace(' agent', '')
      .replace(/\s+/g, '_') as any,

    name: agentName,
    role: agentName,
    order: index + 1,

    status: 'pending' as const,

    progress: 0,

    lastUpdated:
      new Date().toISOString(),

    summaryOutput:
      `${agentName} is waiting to execute.`,
  }))
);

    let statusInterval:
      | ReturnType<typeof setInterval>
      | null = null;

    try {
      /*
       * Start the REAL backend workflow.
       */
      const workflowPromise =
        request<any>(
          '/research/start',
          {
            method: 'POST',
            body: JSON.stringify({
              research_problem: query,
            }),
          }
        );

      /*
       * Read actual backend agent status.
       */
      const updateAgentStatus =
        async () => {
          try {
            const response =
              await agentService.getAgentStatus();

            const backendStatus =
              response.agent_status || {};

            setAgents(prev =>
              prev.map(agent => {
                const status =
                  backendStatus[
                    agent.name
                  ] || 'pending';

                let progress = 0;

                if (
                  status === 'running'
                ) {
                  progress = 50;
                } else if (
                  status === 'completed'
                ) {
                  progress = 100;
                }

                return {
                  ...agent,

                  status:
                    status as any,

                  progress,

                  lastUpdated:
                    new Date().toISOString(),

                  summaryOutput:
                    status === 'running'
                      ? `${agent.name} is currently processing...`
                      : status ===
                        'completed'
                      ? `${agent.name} completed successfully.`
                      : `${agent.name} is waiting to execute.`,
                };
              })
            );
          } catch (error) {
            console.error(
              'Failed to fetch agent status:',
              error
            );
          }
        };

      /*
       * Get initial status.
       */
      await updateAgentStatus();

      /*
       * Poll actual backend status.
       */
      statusInterval =
        setInterval(
          updateAgentStatus,
          500
        );

      /*
       * Wait for the REAL workflow.
       */
      const response =
        await workflowPromise;

      console.log(
        'RESEARCH WORKFLOW RESPONSE:',
        response
      );

      /*
       * Stop polling.
       */
      if (statusInterval) {
        clearInterval(
          statusInterval
        );
        statusInterval = null;
      }

      const workflow =
        response.workflow ?? response;

      /*
       * Final status update.
       */
      await updateAgentStatus();

      /*
       * Replace statuses with
       * completed + REAL summaries.
       */
      setAgents(
        createAgents(
          workflow,
          true
        )
      );

      /*
       * Create Final Research Plan.
       */
      if (
        workflow?.final_research_plan
      ) {
        const plan =
          workflow.final_research_plan;

        setFinalPlan({
          projectId:
            'researchflow',

          topic:
            plan.research_problem,

          generatedDate:
            new Date().toLocaleDateString(),

          problemStatement:
            plan.research_problem,

          novelHypothesis:
            (
              plan.research_ideas ?? []
            ).join('\n'),

          methodologySummary:
            typeof plan.methodology ===
            'object'
              ? Object.values(
                  plan.methodology
                ).join('\n')
              : String(
                  plan.methodology ?? ''
                ),

          datasets: [],
          deliverables: [],
          risksAndMitigations: [],

          humanApprovalStatus:
            plan.approval_status ===
            'approved'
              ? 'approved'
              : plan.approval_status ===
                'rejected'
              ? 'rejected'
              : plan.approval_status ===
                'changes_requested'
              ? 'changes_requested'
              : 'pending_review',
        });
      }
    } catch (error) {
      console.error(
        'Research workflow failed:',
        error
      );

      if (statusInterval) {
        clearInterval(
          statusInterval
        );
        statusInterval = null;
      }
    } finally {
      setIsRunning(false);
    }
  }

  async function approvePlan(
    decision:
      | 'approved'
      | 'rejected'
      | 'changes_requested',
    notes?: string
  ) {
    const res =
      await agentService.submitPlanApproval(
        decision,
        notes
      );

    setFinalPlan({
      ...res.updatedPlan,
    });
  }

  return {
    agents,
    finalPlan,
    isRunning,
    loading,
    runWorkflowSimulation,
    approvePlan,
    reload: loadAgents,
  };
}