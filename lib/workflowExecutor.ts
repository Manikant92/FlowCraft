// Workflow execution and simulation engine
import { Workflow, WorkflowExecution, ExecutionLog } from '@/types/workflow';

/**
 * Execute a workflow (simulated for MVP)
 * In production, this would actually perform actions
 */
export async function executeWorkflow(
  workflow: Workflow,
  onProgress?: (execution: WorkflowExecution) => void
): Promise<WorkflowExecution> {
  const execution: WorkflowExecution = {
    workflowId: workflow.id,
    executionId: `exec-${Date.now()}`,
    status: 'running',
    logs: [],
    startTime: new Date().toISOString(),
  };

  // Initialize logs for all steps
  workflow.steps.forEach(step => {
    execution.logs.push({
      stepId: step.id,
      stepTitle: step.title,
      status: 'pending',
    });
  });

  if (onProgress) onProgress({ ...execution });

  // Execute steps in order, respecting dependencies
  for (const step of workflow.steps) {
    const logIndex = execution.logs.findIndex(log => log.stepId === step.id);
    
    // Check if dependencies are complete
    if (step.dependencies) {
      const depsComplete = step.dependencies.every(depId => {
        const depLog = execution.logs.find(log => log.stepId === depId);
        return depLog?.status === 'completed';
      });
      
      if (!depsComplete) {
        execution.logs[logIndex].status = 'failed';
        execution.logs[logIndex].error = 'Dependencies not met';
        continue;
      }
    }

    // Start step
    execution.logs[logIndex].status = 'running';
    execution.logs[logIndex].startTime = new Date().toISOString();
    
    // Notify progress with deep copy
    if (onProgress) onProgress(JSON.parse(JSON.stringify(execution)));

    // Simulate step execution with delay
    await delay(1000 + Math.random() * 1000);

    // Simulate step result
    const result = simulateStepExecution(step.type, step.title, step.config);
    
    execution.logs[logIndex].status = result.success ? 'completed' : 'failed';
    execution.logs[logIndex].endTime = new Date().toISOString();
    execution.logs[logIndex].output = result.output;
    execution.logs[logIndex].error = result.error;

    // Notify progress with deep copy after completion
    if (onProgress) onProgress(JSON.parse(JSON.stringify(execution)));

    // If step failed and it's critical, stop execution
    if (!result.success && step.type !== 'condition') {
      execution.status = 'failed';
      break;
    }
  }

  // Complete execution
  if (execution.status === 'running') {
    execution.status = 'completed';
  }
  execution.endTime = new Date().toISOString();

  if (onProgress) onProgress({ ...execution });

  return execution;
}

function simulateStepExecution(
  type: string,
  title: string,
  config: Record<string, any>
): { success: boolean; output?: string; error?: string } {
  // Simulate random success/failure (95% success rate for demo)
  const success = Math.random() > 0.05;

  if (!success) {
    return {
      success: false,
      error: 'Simulated execution error',
    };
  }

  // Generate contextual output based on step type
  let output = '';

  switch (type) {
    case 'action':
      output = `✓ Action executed successfully: ${title}`;
      if (config.command) {
        output += `\nCommand: ${config.command}`;
      }
      break;

    case 'condition':
      output = `✓ Condition evaluated: ${title}\nResult: true`;
      break;

    case 'notification':
      output = `✓ Notification sent: ${title}`;
      if (config.channel) {
        output += `\nChannel: ${config.channel}`;
      }
      if (config.message) {
        output += `\nMessage: ${config.message}`;
      }
      break;

    case 'delay':
      output = `✓ Delay completed: ${title}`;
      break;

    default:
      output = `✓ Step completed: ${title}`;
  }

  // Add config details if relevant
  if (config.frequency) {
    output += `\nFrequency: ${config.frequency}`;
  }
  if (config.time) {
    output += `\nScheduled time: ${config.time}`;
  }

  return { success: true, output };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
