import React, { useEffect, useState } from 'react';
import { Quote, Copy, Check, ExternalLink } from 'lucide-react';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

interface CitationRecord {
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  pdf_url?: string;
  source?: string;
  citation_text: string;
}

export const Citations: React.FC = () => {
  const [citations, setCitations] = useState<CitationRecord[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    agentService
      .getCitations()
      .then((data) => {
        setCitations(data as unknown as CitationRecord[]);
      })
      .catch((error) => {
        console.error('Failed to load citations:', error);
      });
  }, []);

  function copyCitation(
    citation: CitationRecord,
    index: number
  ) {
    navigator.clipboard.writeText(citation.citation_text);

    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Quote className="w-6 h-6 text-blue-400" />
          Academic Citations & Bibliography
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Structured academic citations generated from the retrieved
          research papers with verified source and DOI information.
        </p>
      </div>

      {/* Citation Cards */}
      <div className="space-y-4">

        {citations.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">
              No citations available.
            </p>
          </Card>
        ) : (
          citations.map((citation, index) => (

            <Card
              key={citation.doi || citation.url || index}
              className="space-y-4"
            >

              {/* Header */}
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                  <Badge variant="blue">
                    {citation.source || 'Academic Source'}
                  </Badge>

                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm leading-relaxed">
                      {citation.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                      {citation.authors?.join(', ') || 'Authors not available'}
                      {citation.year ? ` (${citation.year})` : ''}
                    </p>
                  </div>

                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyCitation(citation, index)}
                  className="shrink-0 text-xs font-mono inline-flex items-center gap-1 text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  {copiedIndex === index ? 'Copied' : 'Copy'}
                </button>

              </div>

              {/* Citation Text */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  Citation
                </p>

                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
                  {citation.citation_text}
                </pre>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">

                <div className="bg-slate-900/60 rounded-lg px-3 py-2">
                  <span className="text-slate-500">
                    Venue
                  </span>

                  <p className="text-slate-300 mt-1">
                    {citation.venue || 'Not available'}
                  </p>
                </div>

                <div className="bg-slate-900/60 rounded-lg px-3 py-2">
                  <span className="text-slate-500">
                    DOI
                  </span>

                  <p className="text-slate-300 mt-1 break-all">
                    {citation.doi || 'Not available'}
                  </p>
                </div>

              </div>

              {/* DOI / Source Link */}
              {citation.url && citation.url !== 'Not available' && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Source
                </a>
              )}

            </Card>

          ))
        )}

      </div>
    </div>
  );
};