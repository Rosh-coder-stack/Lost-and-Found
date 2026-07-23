import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        
        {/* Connecting line background */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-[#eeedf7] z-0" />

        {/* Progress active line */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-[#00288e] z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((stepLabel, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepLabel} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? 'bg-[#00288e] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#00288e] text-white ring-4 ring-[#eeedf7] shadow-sm'
                    : 'bg-[#eeedf7] text-[#757684]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'text-[#00288e]' : isCompleted ? 'text-[#1a1b22]' : 'text-[#757684]'
                }`}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
