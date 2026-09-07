import { USE_MOCK_DATA, request } from './api';
import { 
  mockAcademicAgents, 
  mockAcademicTasks, 
  mockAcademicDeadlines, 
  mockUser 
} from '../data/mockData';
import type { AcademicTask, AcademicDeadline, AcademicAgent, UserProfile } from '../types';

export const academicService = {
  async getAcademicAgents(): Promise<AcademicAgent[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockAcademicAgents);
    return request<AcademicAgent[]>('/academic/agents');
  },

  async getTasks(): Promise<AcademicTask[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockAcademicTasks);
    return request<AcademicTask[]>('/academic/tasks');
  },

  async createTask(newTask: Omit<AcademicTask, 'id'>): Promise<AcademicTask> {
    if (USE_MOCK_DATA) {
      const task: AcademicTask = {
        ...newTask,
        id: 't_' + Date.now()
      };
      mockAcademicTasks.unshift(task);
      return Promise.resolve(task);
    }
    return request<AcademicTask>('/academic/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask)
    });
  },

  async toggleTask(id: string): Promise<AcademicTask | undefined> {
    if (USE_MOCK_DATA) {
      const found = mockAcademicTasks.find(t => t.id === id);
      if (found) found.completed = !found.completed;
      return Promise.resolve(found);
    }
    return request<AcademicTask>(`/academic/tasks/${id}/toggle`, { method: 'PATCH' });
  },

  async getDeadlines(): Promise<AcademicDeadline[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockAcademicDeadlines);
    return request<AcademicDeadline[]>('/academic/deadlines');
  },

  async getUserProfile(): Promise<UserProfile> {
    if (USE_MOCK_DATA) return Promise.resolve(mockUser);
    return request<UserProfile>('/user/profile');
  }
};
