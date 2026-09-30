import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';

interface MethodologyData {
  problem_definition: string;
  research_objective: string;
  data_collection: string;
  preprocessing: string;
  baseline_models: string;
  proposed_approach: string;
  training_strategy: string;
  evaluation: string;
  explainability: string;
  expected_outcome: string;
}

const methodologySections: {
  key: keyof MethodologyData;
  title: string;
}[] = [
  { key: 'problem_definition', title: 'Problem Definition' },
  { key: 'research_objective', title: 'Research Objective' },
  { key: 'data_collection', title: 'Data Collection' },
  { key: 'preprocessing', title: 'Preprocessing' },
  { key: 'baseline_models', title: 'Baseline Models' },
  { key: 'proposed_approach', title: 'Proposed Approach' },
  { key: 'training_strategy', title: 'Training Strategy' },
  { key: 'evaluation', title: 'Evaluation' },
  { key: 'explainability', title: 'Explainability' },
  { key: 'expected_outcome', title: 'Expected Outcome' },
];

export const Methodology: React.FC = () => {
  const [methodology, setMethodology] =
    useState<MethodologyData | null>(null);

  useEffect(() => {
    agentService
      .getMethodology()
      .then((data) => setMethodology(data))
      .catch((error) => {
        console.error('Failed to load methodology:', error);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-400" />
          Recommended Research Methodology
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Formulated by the Methodology Agent from the selected research
          direction and identified research gaps.
        </p>
      </div>

      {!methodology ? (
        <Card>
          <p className="text-sm text-slate-400">
            Loading methodology...
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {methodologySections.map((section, index) => (
            <Card key={section.key} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h4 className="font-bold text-white text-sm">
                  {section.title}
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-10">
                {methodology[section.key] || 'Not available'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};