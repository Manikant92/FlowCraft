import { WorkflowExecution, Workflow } from '@/types/workflow';

interface Props {
  execution: WorkflowExecution;
  workflow: Workflow;
}

export default function ExecutionSummary({ execution, workflow }: Props) {
  if (execution.status !== 'completed' && execution.status !== 'failed') {
    return null;
  }

  const duration = execution.startTime && execution.endTime
    ? ((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000).toFixed(2)
    : '-';

  const completedSteps = execution.logs.filter(log => log.status === 'completed').length;
  const totalSteps = execution.logs.length;

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 p-6 ${
      execution.status === 'completed' 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
    }`}>
      {/* Success/Failure Banner */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${
        execution.status === 'completed' 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
          : 'bg-gradient-to-r from-red-500 to-rose-500'
      }`} />

      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={`flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center shadow-lg ${
          execution.status === 'completed' 
            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
            : 'bg-gradient-to-br from-red-500 to-rose-500'
        }`}>
          <span className="text-4xl">
            {execution.status === 'completed' ? '✅' : '❌'}
          </span>
        </div>

        {/* Summary Content */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {execution.status === 'completed' ? '🎉 Workflow Completed Successfully' : '⚠️ Workflow Failed'}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600 mb-1">Trigger</div>
              <div className="font-semibold text-slate-900 text-sm">{workflow.trigger.description}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600 mb-1">Steps Completed</div>
              <div className="font-semibold text-slate-900 text-sm">{completedSteps} / {totalSteps}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600 mb-1">Duration</div>
              <div className="font-semibold text-slate-900 text-sm">{duration}s</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-600 mb-1">Status</div>
              <div className={`font-semibold text-sm ${
                execution.status === 'completed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {execution.status === 'completed' ? 'Success' : 'Failed'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700 mb-2">📋 Actions Taken:</div>
            <ul className="space-y-1">
              {execution.logs.map((log, idx) => (
                <li key={log.stepId} className="text-sm text-slate-600 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    log.status === 'completed' ? 'bg-green-100 text-green-700' :
                    log.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{log.stepTitle}</span>
                  {log.status === 'completed' && <span className="text-green-600">✓</span>}
                  {log.status === 'failed' && <span className="text-red-600">✗</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
