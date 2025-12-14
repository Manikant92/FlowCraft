import { WorkflowTrigger } from '@/types/workflow';

interface Props {
  trigger: WorkflowTrigger;
}

export default function TriggerDisplay({ trigger }: Props) {
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'schedule': return '⏰';
      case 'event': return '⚡';
      case 'manual': return '▶️';
      default: return '🔄';
    }
  };

  const getTriggerColor = (type: string) => {
    switch (type) {
      case 'schedule': return 'from-purple-500 to-pink-500';
      case 'event': return 'from-blue-500 to-cyan-500';
      case 'manual': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTriggerBg = (type: string) => {
    switch (type) {
      case 'schedule': return 'bg-purple-50 border-purple-200';
      case 'event': return 'bg-blue-50 border-blue-200';
      case 'manual': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`relative overflow-hidden border-2 rounded-xl p-6 ${getTriggerBg(trigger.type)}`}>
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTriggerColor(trigger.type)}`} />
      
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getTriggerColor(trigger.type)} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}>
          <span className="text-3xl">{getTriggerIcon(trigger.type)}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-white rounded-full shadow-sm">
              Trigger
            </span>
            <span className="px-2.5 py-1 text-xs font-medium capitalize bg-white rounded-full shadow-sm">
              {trigger.type}
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900 leading-tight">
            {trigger.description}
          </p>
          {trigger.config?.schedule && (
            <p className="text-sm text-slate-600 mt-1">
              Schedule: {trigger.config.schedule}
            </p>
          )}
          {trigger.config?.event && (
            <p className="text-sm text-slate-600 mt-1">
              Event: {trigger.config.event}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
