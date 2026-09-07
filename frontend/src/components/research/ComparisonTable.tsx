import React from 'react';
import type { ComparisonMatrixRow } from '../../types';

interface Props {
  rows: ComparisonMatrixRow[];
}

export const ComparisonTable: React.FC<Props> = ({ rows }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
            <th className="p-4 font-semibold w-1/4">Paper & Citation</th>
            <th className="p-4 font-semibold w-1/5">Methodology</th>
            <th className="p-4 font-semibold w-1/6">Dataset</th>
            <th className="p-4 font-semibold w-1/5">Empirical Results</th>
            <th className="p-4 font-semibold w-1/5">Limitations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rows.map((row) => (
            <tr key={row.paperId} className="hover:bg-slate-850/50 transition">
              <td className="p-4 font-medium text-slate-100">
                <div className="font-semibold text-blue-400">{row.paperTitle}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Published: {row.year}</div>
              </td>
              <td className="p-4 text-slate-300">{row.methodology}</td>
              <td className="p-4 text-emerald-300 font-mono text-[11px]">{row.dataset}</td>
              <td className="p-4 text-slate-200">
                <span className="inline-block bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                  {row.results}
                </span>
              </td>
              <td className="p-4 text-rose-300/90">{row.limitations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
