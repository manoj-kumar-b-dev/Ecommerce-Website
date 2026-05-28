import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Shipping' },
  { id: 2, name: 'Payment' },
  { id: 3, name: 'Review' }
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="w-full py-4 bg-white border border-gray-100 rounded-xl mb-8 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between px-6">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center relative">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${isCompleted ? 'bg-primary border-primary text-white' : isActive ? 'border-primary text-primary bg-white' : 'border-gray-200 text-gray-400 bg-white'}`}>
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
                </div>
                <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {step.name}
                </span>
              </div>
              
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-4 -mt-6 bg-gray-100 overflow-hidden">
                  <div className={`h-full bg-primary transition-all duration-500`} style={{ width: isCompleted ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;