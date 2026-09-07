import React, { useEffect, useState } from 'react';
import { Quote, Copy, Check } from 'lucide-react';
import type { CitationItem } from '../../types';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Citations: React.FC = () => {
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    agentService.getCitations().then((data: CitationItem[]) => setCitations(data));
  }, []);

  function copyCitation(c: CitationItem) {
    navigator.clipboard.writeText(c.rawCitation);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Quote className="w-6 h-6 text-blue-400" /> Academic Citations & Bibliography
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Verified source provenance and auto-formatted BibTeX, APA-7, and IEEE citations prepared by the Citation Agent.
        </p>
      </div>

      <div className="space-y-4">
        {citations.map(c => (
          <Card key={c.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={c.format === 'BibTeX' ? 'purple' : c.format === 'APA' ? 'blue' : 'emerald'}>
                  {c.format}
                </Badge>
                <h4 className="font-semibold text-slate-200 text-xs">{c.paperTitle}</h4>
              </div>
              <button 
                onClick={() => copyCitation(c)}
                className="text-xs font-mono inline-flex items-center gap-1 text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === c.id ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
              {c.rawCitation}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
};
