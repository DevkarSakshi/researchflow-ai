import { useState, useEffect } from 'react';
import type { AcademicAgent, AcademicAnalytics, AcademicDeadline, AcademicProgress, AcademicProject, AcademicReminder, AcademicTask, AcademicTaskInput } from '../types';
import { academicService } from '../services/academicService';

export function useAcademic() {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>([]);
  const [agents, setAgents] = useState<AcademicAgent[]>([]);
  const [project, setProject] = useState<AcademicProject | null>(null);
  const [milestones, setMilestones] = useState<{ id: string; name: string; target_date: string; task_id: string; status?: string }[]>([]);
  const [reminders, setReminders] = useState<AcademicReminder[]>([]);
  const [progress, setProgress] = useState<AcademicProgress | null>(null);
  const [analytics, setAnalytics] = useState<AcademicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [state, dList, aList] = await Promise.all([
        academicService.getState(),
        academicService.getDeadlines(),
        academicService.getAcademicAgents()
      ]);
      setTasks(state.tasks);
      setDeadlines(dList);
      setAgents(aList);
      setProject(state.project);
      setMilestones(state.milestones);
      setReminders(state.reminders);
      setProgress(state.progress);
      setAnalytics(state.analytics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load academic workflow data.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: string) {
    await academicService.toggleTask(id);
    await loadData();
  }

  async function addTask(newTask: AcademicTaskInput) {
    await academicService.createTask(newTask);
    await loadData();
  }

  return {
    tasks,
    deadlines,
    agents,
    project,
    milestones,
    reminders,
    progress,
    analytics,
    loading,
    error,
    toggleTask,
    addTask,
    reload: loadData
  };
}
