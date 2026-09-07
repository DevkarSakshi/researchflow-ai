import { useState, useEffect } from 'react';
import type { AcademicTask, AcademicDeadline, AcademicAgent } from '../types';
import { academicService } from '../services/academicService';

export function useAcademic() {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>([]);
  const [agents, setAgents] = useState<AcademicAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tList, dList, aList] = await Promise.all([
        academicService.getTasks(),
        academicService.getDeadlines(),
        academicService.getAcademicAgents()
      ]);
      setTasks(tList);
      setDeadlines(dList);
      setAgents(aList);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    await academicService.toggleTask(id);
  }

  async function addTask(newTask: Omit<AcademicTask, 'id'>) {
    const created = await academicService.createTask(newTask);
    setTasks(prev => [created, ...prev]);
  }

  return {
    tasks,
    deadlines,
    agents,
    loading,
    toggleTask,
    addTask,
    reload: loadData
  };
}
