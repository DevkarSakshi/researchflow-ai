import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import type { MethodologyStep } from '../../types';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';

export const Methodology: React.FC = () => {
  const [steps, setSteps] = useState<MethodologyStep[]>([]);

  useEffect(() => {
    agentService.getMethodology().then((data: MethodologyStep[]) => setSteps(data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-400" /> Recommended Research Methodology
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Formulated by the Methodology Agent: Phased experimental protocol, inputs/outputs, and tooling stack.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map(step => (
          <Card key={step.stepNumber} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                0{step.stepNumber}
              </span>
              <h4 className="font-bold text-white text-sm">{step.title}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-10">
              {step.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-10 pt-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Inputs</span>
                <span className="text-slate-300 mt-0.5 block">{step.inputs.join(', ')}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Outputs</span>
                <span className="text-slate-300 mt-0.5 block">{step.outputs.join(', ')}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Tools & Libraries</span>
                <span className="text-blue-400 font-mono text-[11px] mt-0.5 block">{step.recommendedTools.join(', ')}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
