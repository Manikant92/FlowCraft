// Core workflow types and schema

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'notification';
  title: string;
  description: string;
  reasoning: string; // AI explanation for why this step exists
  config: Record<string, any>;
  dependencies?: string[]; // IDs of steps that must complete first
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  description: string;
  config?: {
    event?: string;
    schedule?: string;
    cron?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  domain: 'reminders' | 'automation' | 'app-setup' | 'general';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  metadata: {
    createdAt: string;
    userInput: string; // Original natural language input
    agentReasoning: string; // Overall reasoning about the workflow
  };
}

export interface ExecutionLog {
  stepId: string;
  stepTitle: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  output?: string;
  error?: string;
}

export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  logs: ExecutionLog[];
  startTime?: string;
  endTime?: string;
}
