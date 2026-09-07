import React from 'react';
import { Award, BookOpen, Mail, Building, GraduationCap } from 'lucide-react';
import { mockUser } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Profile: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Student Banner */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
        <img 
          src={mockUser.avatarUrl} 
          alt={mockUser.fullName} 
          className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/50 shadow-xl"
        />
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white">{mockUser.fullName}</h2>
            <Badge variant="emerald">Academic Scholar</Badge>
          </div>
          <p className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-2">
            <GraduationCap className="w-4 h-4 text-blue-400" /> {mockUser.degree} • {mockUser.institution}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {mockUser.email}</span>
            <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Advisor: {mockUser.advisor}</span>
          </div>
        </div>
      </Card>

      {/* Academic Details & Research Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Academic Standing & Metrics
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Cumulative GPA:</span>
              <span className="text-white font-mono font-bold">{mockUser.gpa}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Department:</span>
              <span className="text-white">{mockUser.department}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Current Semester:</span>
              <span className="text-white">{mockUser.currentSemester}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> Research Interests & Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {mockUser.researchInterests.map((interest, i) => (
              <Badge key={i} variant="purple" size="md">
                {interest}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
