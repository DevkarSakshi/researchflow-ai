import { useState, useEffect } from 'react';
import type { ResearchAgent, FinalResearchPlan } from '../types';
import { agentService } from '../services/agentService';

export function useAgents() {
  const [agents, setAgents] = useState<ResearchAgent[]>([]);
  const [finalPlan, setFinalPlan] = useState<FinalResearchPlan | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    try {
      const [agentList, plan] = await Promise.all([
        agentService.getAllAgents(),
        agentService.getFinalPlan()
      ]);
      setAgents(agentList);
      setFinalPlan(plan);
    } finally {
      setLoading(false);
    }
  }

  async function runWorkflowSimulation(query: string) {
    setIsRunning(true);
    await agentService.triggerWorkflow(query);

    setAgents(prev => prev.map((a, i) => ({
      ...a,
      status: i === 0 ? 'running' : 'pending',
      progress: i === 0 ? 30 : 0
    })));

    for (let i = 0; i < agents.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setAgents(prev => prev.map((a, idx) => {
        if (idx === i) return { ...a, status: 'completed', progress: 100 };
        if (idx === i + 1) return { ...a, status: 'running', progress: 45 };
        return a;
      }));
    }

    setIsRunning(false);
  }

  async function approvePlan(decision: 'approved' | 'rejected' | 'changes_requested', notes?: string) {
    const res = await agentService.submitPlanApproval(decision, notes);
    setFinalPlan({ ...res.updatedPlan });
  }

  return {
    agents,
    finalPlan,
    isRunning,
    loading,
    runWorkflowSimulation,
    approvePlan,
    reload: loadAgents
  };
}
