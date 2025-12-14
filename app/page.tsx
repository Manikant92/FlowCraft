'use client';

import { useState, useEffect } from 'react';
import { Workflow, WorkflowExecution } from '@/types/workflow';
import { executeWorkflow } from '@/lib/workflowExecutor';
import WorkflowVisualizer from '@/components/WorkflowVisualizer';
import ExecutionLog from '@/components/ExecutionLog';
import TriggerDisplay from '@/components/TriggerDisplay';
import ExecutionSummary from '@/components/ExecutionSummary';

const EXAMPLE_PROMPTS = [
  'Send me a reminder every morning at 9am to review my tasks',
  'Set up a new React project with TypeScript and testing',
  'Send an email notification when a new user signs up'
];

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<Workflow[]>([]);
  const [editingSteps, setEditingSteps] = useState(false);
  const [cliLogs, setCliLogs] = useState<string[]>([]);

  // Load workflow history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('workflowHistory');
    if (saved) {
      try {
        setWorkflowHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load workflow history');
      }
    }
  }, []);

  // Save to workflow history
  const saveToHistory = (newWorkflow: Workflow) => {
    const updated = [newWorkflow, ...workflowHistory.filter(w => w.id !== newWorkflow.id)].slice(0, 3);
    setWorkflowHistory(updated);
    localStorage.setItem('workflowHistory', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    setLoading(true);
    setError(null);
    setClarificationQuestion(null);
    setExecution(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      if (data.clarificationNeeded) {
        setClarificationQuestion(data.clarificationQuestion);
        setError('Input too vague. Please provide more details (see suggestion below).');
      }

      setWorkflow(data.workflow);
      if (data.workflow && data.workflow.steps.length > 0) {
        saveToHistory(data.workflow);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // Provide helpful suggestions
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;

    setExecution(null);
    
    try {
      await executeWorkflow(workflow, (updatedExecution) => {
        setExecution({ ...updatedExecution });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    }
  };

  const handleClear = () => {
    setWorkflow(null);
    setExecution(null);
    setUserInput('');
    setError(null);
    setClarificationQuestion(null);
    setEditingSteps(false);
  };

  const handleExampleClick = (example: string) => {
    setUserInput(example);
    setError(null);
    setClarificationQuestion(null);
  };

  const loadFromHistory = (historicalWorkflow: Workflow) => {
    setWorkflow(historicalWorkflow);
    setUserInput(historicalWorkflow.metadata.userInput);
    setExecution(null);
    setError(null);
    setClarificationQuestion(null);
  };

  const handleUpdateWorkflow = (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
    setExecution(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                ✨ Flowcraft
              </h1>
              <p className="mt-2 text-lg text-slate-600 italic">
                Craft workflows with words.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/cline/cline"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-sm font-medium text-blue-900">⚡ Powered by</span>
                <span className="text-sm font-bold text-blue-700">Cline CLI</span>
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm font-medium">▲</span>
                <span className="text-sm font-bold">Vercel</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="workflow-input" className="block text-sm font-medium text-slate-700 mb-2">
            Describe your workflow
          </label>
          <textarea
            id="workflow-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Try one of the examples below, or describe your own workflow..."
            className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-400"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleGenerate();
              }
            }}
          />
          
          {/* Quick Examples */}
          <div className="mt-3 mb-4">
            <p className="text-xs font-medium text-slate-600 mb-2">Quick examples (click to use):</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-300"
                  disabled={loading}
                >
                  💡 {example.length > 50 ? example.substring(0, 50) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={handleGenerate}
              disabled={loading || !userInput.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generating...
                </span>
              ) : (
                '✨ Generate Workflow'
              )}
            </button>
            
            {workflow && (
              <>
                <button
                  onClick={handleExecute}
                  disabled={execution?.status === 'running'}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {execution?.status === 'running' ? '⏳ Running...' : '▶️ Execute Workflow'}
                </button>
                
                <button
                  onClick={() => setEditingSteps(!editingSteps)}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  {editingSteps ? '👁️ View Mode' : '✏️ Edit Steps'}
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-6 py-2.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  🔄 Clear
                </button>
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium mb-2">❌ {error}</p>
              <p className="text-red-700 text-xs">
                <strong>Tip:</strong> Try to be more specific. Include what action you want, when it should happen, and any relevant details.
              </p>
            </div>
          )}

          {/* Clarification Question */}
          {clarificationQuestion && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium">💡 {clarificationQuestion}</p>
            </div>
          )}

          {/* Workflow History */}
          {workflowHistory.length > 0 && !workflow && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">📚 Recent Workflows:</p>
              <div className="space-y-2">
                {workflowHistory.map((hw) => (
                  <button
                    key={hw.id}
                    onClick={() => loadFromHistory(hw)}
                    className="block w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded text-sm text-blue-800 border border-blue-300 transition-colors"
                  >
                    <span className="font-medium">{hw.name}</span>
                    <span className="text-xs text-blue-600 ml-2">({hw.steps.length} steps)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Display */}
        {workflow && (
          <div className="space-y-6">
            {/* Agent Reasoning */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                🧠 Agent Reasoning
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm leading-relaxed">
                  {workflow.metadata.agentReasoning}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-xs">Workflow Name:</span>
                  <p className="font-medium text-slate-900">{workflow.name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-xs">Domain:</span>
                  <p className="font-medium text-slate-900 capitalize">{workflow.domain}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-xs">Total Steps:</span>
                  <p className="font-medium text-slate-900">{workflow.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Trigger Display */}
            <TriggerDisplay trigger={workflow.trigger} />

            {/* Workflow Visualization */}
            <WorkflowVisualizer 
              workflow={workflow} 
              editMode={editingSteps}
              onUpdate={handleUpdateWorkflow}
            />

            {/* Execution Summary */}
            {execution && <ExecutionSummary execution={execution} workflow={workflow} />}

            {/* Execution Log */}
            {execution && <ExecutionLog execution={execution} />}
          </div>
        )}

        {/* Empty State */}
        {!workflow && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Ready to build workflows?
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Enter a natural language description above, and the AI agent will convert it into a structured, executable workflow with clear reasoning for each step.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-medium text-slate-900 mb-1">Reminders</h4>
                <p className="text-sm text-slate-600">Schedule notifications and alerts</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-slate-900 mb-1">Automation</h4>
                <p className="text-sm text-slate-600">Automate repetitive tasks</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl mb-2">🛠️</div>
                <h4 className="font-medium text-slate-900 mb-1">App Setup</h4>
                <p className="text-sm text-slate-600">Initialize new projects</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
