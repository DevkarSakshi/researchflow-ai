import { request } from './api';
import type {
  AcademicAgent,
  AcademicAnalytics,
  AcademicDeadline,
  AcademicProgress,
  AcademicProject,
  AcademicReminder,
  AcademicTask,
  AcademicTaskInput,
} from '../types';

export interface AcademicWorkflowState {
  project: AcademicProject | null;
  tasks: AcademicTask[];
  milestones: { id: string; name: string; target_date: string; task_id: string; status?: string }[];
  reminders: AcademicReminder[];
  progress: AcademicProgress;
  analytics: AcademicAnalytics;
}

export const academicService = {
  getState(): Promise<AcademicWorkflowState> {
    return request<AcademicWorkflowState>('/academic/state');
  },

  getAcademicAgents(): Promise<AcademicAgent[]> {
    return request<AcademicAgent[]>('/academic/agents');
  },

  getDeadlines(): Promise<AcademicDeadline[]> {
    return request<AcademicDeadline[]>('/academic/deadlines');
  },

  async getTasks(): Promise<AcademicTask[]> {
    return request<AcademicTask[]>('/academic/tasks');
  },

  createTask(newTask: AcademicTaskInput): Promise<AcademicTask> {
    return request<AcademicTask>('/academic/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask)
    });
  },

  toggleTask(id: string): Promise<AcademicTask> {
    return request<AcademicTask>(`/academic/tasks/${id}/toggle`, { method: 'PATCH' });
  },
};
