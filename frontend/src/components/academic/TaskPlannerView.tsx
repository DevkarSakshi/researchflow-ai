import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Calendar, Tag } from 'lucide-react';
import type { AcademicTask } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface Props {
  tasks: AcademicTask[];
  onToggle: (id: string) => void;
  onAdd: (task: Omit<AcademicTask, 'id'>) => void;
}

export const TaskPlannerView: React.FC<Props> = ({ tasks, onToggle, onAdd }) => {
  const [newTitle, setNewTitle] = useState('');
  const [course, setCourse] = useState('Research Project');
  const [dueDate, setDueDate] = useState('2026-09-20');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle,
      type: 'research_milestone',
      courseOrProject: course,
      dueDate,
      completed: false,
      priority,
      assignedAgent: 'planner'
    });
    setNewTitle('');
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-3 items-center">
        <input 
          type="text" 
          placeholder="New academic task, paper reading, or research milestone..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="flex-1 min-w-[240px] bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="text" 
          placeholder="Course / Area"
          value={course}
          onChange={e => setCourse(e.target.value)}
          className="w-36 bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
        />
        <input 
          type="date" 
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
        />
        <select 
          value={priority} 
          onChange={e => setPriority(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <Button size="sm" type="submit" icon={<Plus className="w-4 h-4" />}>
          Add Task
        </Button>
      </form>

      <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onToggle(task.id)}
            className="p-4 flex items-center justify-between hover:bg-slate-850/60 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-blue-400 cursor-pointer">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <h5 className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </h5>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {task.courseOrProject}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {task.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'slate'}>
                {task.priority}
              </Badge>
              {task.assignedAgent && (
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  agent:{task.assignedAgent}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
