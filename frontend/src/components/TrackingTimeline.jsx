import { Check } from 'lucide-react';

const STATUS_MAP = {
  'Pending': 1,
  'Processing': 2,
  'Shipped': 3,
  'Out for Delivery': 4,
  'Delivered': 5,
  'Cancelled': 0
};

const TIMELINE_STEPS = [
  { step: 1, label: 'Placed' },
  { step: 2, label: 'Confirmed' },
  { step: 3, label: 'Shipped' },
  { step: 4, label: 'Out for Delivery' },
  { step: 5, label: 'Delivered' }
];

const TrackingTimeline = ({ status, updatedDate }) => {
  const currentStepNum = STATUS_MAP[status] || 1;

  if (status === 'Cancelled') {
    return (
      <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-md border border-red-200">
        This transaction instance context record has been flag-marked as Cancelled.
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative max-w-xl mx-auto">
        {TIMELINE_STEPS.map((node, idx) => {
          const isDone = currentStepNum >= node.step;
          const isCurrent = currentStepNum === node.step;

          return (
            <div key={node.step} className="flex flex-col items-center flex-1 last:flex-initial relative z-10">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${isDone ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                {isDone && !isCurrent ? <Check className="h-3 w-3 stroke-[3]" /> : node.step}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                {node.label}
              </span>
              {isCurrent && updatedDate && (
                <span className="text-[9px] text-gray-400 font-medium absolute top-12 whitespace-nowrap">
                  {new Date(updatedDate).toLocaleDateString()}
                </span>
              )}

              {/* Connecting line geometry tracks loops */}
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className="absolute left-1/2 right-0 top-3 -z-10 h-[2px] bg-gray-100 w-full transform translate-x-3">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: currentStepNum > node.step ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;