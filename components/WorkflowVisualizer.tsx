import { useState } from 'react';
import { Workflow, WorkflowStep } from '@/types/workflow';

interface Props {
  workflow: Workflow;
  editMode?: boolean;
  onUpdate?: (workflow: Workflow) => void;
}

export default function WorkflowVisualizer({ workflow, editMode = false, onUpdate }: Props) {
  const [editedSteps, setEditedSteps] = useState<WorkflowStep[]>(workflow.steps);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'action': return '⚡';
      case 'condition': return '🔀';
      case 'notification': return '📨';
      case 'delay': return '⏱️';
      default: return '📋';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'condition': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'notification': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'delay': return 'bg-gray-50 border-gray-200 text-gray-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const handleStepEdit = (stepId: string, field: 'title' | 'description', value: string) => {
    const updated = editedSteps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    );
    setEditedSteps(updated);
  };

  const handleSaveChanges = () => {
    if (onUpdate) {
      onUpdate({
        ...workflow,
        steps: editedSteps
      });
      setSaveMessage('✅ Changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const isFirstStep = (index: number) => index === 0;
  const isLastStep = (index: number) => index === workflow.steps.length - 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          📊 Workflow Steps
        </h2>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-sm font-medium text-green-600 animate-pulse">
              {saveMessage}
            </span>
          )}
          {editMode && onUpdate && (
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Save Changes
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {editedSteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection Line */}
            {index < editedSteps.length - 1 && (
              <div className="absolute left-6 top-full w-0.5 h-4 bg-slate-300 z-0" />
            )}
            
            {/* Start/End Badge */}
            {(isFirstStep(index) || isLastStep(index)) && (
              <div className="absolute -top-2 -right-2 z-10">
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                  isFirstStep(index) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {isFirstStep(index) ? '🚀 START' : '🎯 END'}
                </span>
              </div>
            )}
            
            {/* Step Card */}
            <div className={`relative border-2 rounded-lg p-4 ${getStepColor(step.type)} transition-all hover:shadow-md ${
              editMode ? 'ring-2 ring-purple-300' : ''
            }`}>
              <div className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-current flex items-center justify-center text-2xl font-bold">
                    {getStepIcon(step.type)}
                  </div>
                  <div className="text-center mt-1 text-xs font-medium opacity-75">
                    Step {index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleStepEdit(step.id, 'title', e.target.value)}
                            className="w-full font-semibold text-lg mb-2 px-2 py-1 border border-slate-300 rounded bg-white"
                          />
                          <textarea
                            value={step.description}
                            onChange={(e) => handleStepEdit(step.id, 'description', e.target.value)}
                            className="w-full text-sm opacity-90 mb-2 px-2 py-1 border border-slate-300 rounded bg-white resize-none"
                            rows={2}
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm opacity-90 mb-2">
                            {step.description}
                          </p>
                        </>
                      )}
                      
                      {/* Step Type Badge */}
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-white bg-opacity-50 mb-2">
                        {step.type.toUpperCase()}
                      </span>

                      {/* Dependencies */}
                      {step.dependencies && step.dependencies.length > 0 && (
                        <div className="mt-2 text-xs opacity-75">
                          <span className="font-medium">Depends on:</span>{' '}
                          {step.dependencies.map((depId) => {
                            const depStep = workflow.steps.find(s => s.id === depId);
                            return depStep?.title || depId;
                          }).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Reasoning - Always visible for judges */}
                  <div className="mt-3 p-3 bg-white bg-opacity-70 rounded border border-current border-opacity-30">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium">💭</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium opacity-75 mb-1">Agent Reasoning:</p>
                        <p className="text-sm leading-relaxed">
                          {step.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  {Object.keys(step.config).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium opacity-75 hover:opacity-100 transition-opacity">
                        ⚙️ Configuration
                      </summary>
                      <div className="mt-2 p-3 bg-white bg-opacity-50 rounded">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(step.config, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{workflow.steps.length}</div>
            <div className="text-sm text-slate-600">Total Steps</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {workflow.steps.filter(s => s.type === 'action').length}
            </div>
            <div className="text-sm text-slate-600">Actions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {workflow.steps.filter(s => s.type === 'condition').length}
            </div>
            <div className="text-sm text-slate-600">Conditions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {workflow.steps.filter(s => s.type === 'notification').length}
            </div>
            <div className="text-sm text-slate-600">Notifications</div>
          </div>
        </div>
      </div>
    </div>
  );
}
