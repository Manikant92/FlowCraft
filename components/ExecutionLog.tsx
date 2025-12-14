import { WorkflowExecution } from '@/types/workflow';

interface Props {
  execution: WorkflowExecution;
}

export default function ExecutionLog({ execution }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'running': return 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'failed': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-50 border-gray-200';
      case 'running': return 'bg-blue-50 border-blue-300';
      case 'completed': return 'bg-green-50 border-green-300';
      case 'failed': return 'bg-red-50 border-red-300';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = (endTime - startTime) / 1000;
    return `${duration.toFixed(2)}s`;
  };

  const completedSteps = execution.logs.filter(log => log.status === 'completed').length;
  const runningSteps = execution.logs.filter(log => log.status === 'running').length;
  const totalSteps = execution.logs.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        📝 Execution Log
      </h2>

      {/* Overall Status */}
      <div className={`border-2 rounded-lg p-4 mb-6 ${getOverallStatusColor(execution.status)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {getStatusIcon(execution.status)}
            </span>
            <div>
              <h3 className="font-semibold text-lg capitalize">
                Execution {execution.status}
              </h3>
              <p className="text-sm opacity-75">
                ID: {execution.executionId}
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <div><strong>Started:</strong> {formatTime(execution.startTime)}</div>
            {execution.endTime && (
              <>
                <div><strong>Ended:</strong> {formatTime(execution.endTime)}</div>
                <div><strong>Duration:</strong> {calculateDuration(execution.startTime, execution.endTime)}</div>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold inline-block text-slate-600">
              Progress
            </span>
            <span className="text-xs font-semibold inline-block text-slate-600">
              {completedSteps} / {totalSteps} steps
            </span>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Step Logs */}
      <div className="space-y-3">
        {execution.logs.map((log, index) => (
          <div
            key={log.stepId}
            className={`border-2 rounded-lg p-4 ${getStatusColor(log.status)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">
                {getStatusIcon(log.status)}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      Step {index + 1}: {log.stepTitle}
                    </h4>
                    <span className="text-xs font-medium uppercase opacity-75">
                      {log.status}
                    </span>
                  </div>
                  
                  {log.startTime && (
                    <div className="text-xs text-right">
                      <div>Start: {formatTime(log.startTime)}</div>
                      {log.endTime && (
                        <>
                          <div>End: {formatTime(log.endTime)}</div>
                          <div className="font-medium">
                            {calculateDuration(log.startTime, log.endTime)}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Output */}
                {log.output && (
                  <div className="mt-2 p-3 bg-white bg-opacity-50 rounded text-sm">
                    <div className="font-medium mb-1">Output:</div>
                    <pre className="whitespace-pre-wrap text-xs">{log.output}</pre>
                  </div>
                )}

                {/* Error */}
                {log.error && (
                  <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-sm">
                    <div className="font-medium text-red-900 mb-1">Error:</div>
                    <pre className="whitespace-pre-wrap text-xs text-red-800">{log.error}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {execution.status === 'completed' || execution.status === 'failed' && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalSteps}</div>
              <div className="text-sm text-slate-600">Total Steps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {execution.logs.filter(l => l.status === 'completed').length}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {execution.logs.filter(l => l.status === 'failed').length}
              </div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {execution.logs.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
