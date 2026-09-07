import React from 'react';
import { ExternalLink, Calendar, Users, Cpu, Database } from 'lucide-react';
import type { ResearchPaper } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface Props {
  paper: ResearchPaper;
}

export const PaperCard: React.FC<Props> = ({ paper }) => {
  return (
    <Card hoverEffect className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue">{paper.venue}</Badge>
            <Badge variant="purple">{paper.relevanceScore}% Match</Badge>
          </div>
          <h3 className="font-semibold text-base text-slate-100 leading-snug">{paper.title}</h3>
        </div>
        <button 
          onClick={() => alert(`Opening PDF for paper: ${paper.title}`)}
          className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition cursor-pointer"
          title="View Original Paper"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {paper.authors.join(', ')}</span>
        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {paper.year}</span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        {paper.summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block font-medium flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-blue-400" /> Methodology:
          </span>
          <span className="text-slate-200 mt-1 block">{paper.methodology}</span>
        </div>
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block font-medium flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> Dataset:
          </span>
          <span className="text-slate-200 mt-1 block">{paper.dataset}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
        {paper.tags.map((t, idx) => (
          <span key={idx} className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            #{t}
          </span>
        ))}
      </div>
    </Card>
  );
};
