// AI Agent for converting natural language to structured workflows
import { Workflow, WorkflowStep, WorkflowTrigger } from '@/types/workflow';

export interface GeneratorResult {
  workflow: Workflow;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}

/**
 * Simple rule-based workflow generator
 * In a production app, this would call an LLM API (OpenAI, Anthropic, etc.)
 * For this MVP, we use pattern matching and templates
 */
export function generateWorkflow(userInput: string): GeneratorResult {
  const input = userInput.toLowerCase().trim();
  
  // Check if input is too vague
  if (input.length < 10 || !input.includes(' ')) {
    return {
      workflow: createEmptyWorkflow(userInput),
      clarificationNeeded: true,
      clarificationQuestion: 'Could you provide more details about what you want to accomplish? For example: "Send me a reminder every morning at 9am" or "Set up a new React project with testing"'
    };
  }

  // Detect domain and generate appropriate workflow
  if (input.includes('remind') || input.includes('notification') || input.includes('alert')) {
    return { workflow: generateReminderWorkflow(userInput, input) };
  }
  
  if (input.includes('setup') || input.includes('create project') || input.includes('initialize')) {
    return { workflow: generateAppSetupWorkflow(userInput, input) };
  }
  
  if (input.includes('email') || input.includes('send') || input.includes('notify')) {
    return { workflow: generateNotificationWorkflow(userInput, input) };
  }

  // Default: create a general automation workflow
  return { workflow: generateGeneralWorkflow(userInput, input) };
}

function createEmptyWorkflow(userInput: string): Workflow {
  return {
    id: generateId(),
    name: 'New Workflow',
    description: '',
    domain: 'general',
    trigger: { type: 'manual', description: 'Run manually' },
    steps: [],
    metadata: {
      createdAt: new Date().toISOString(),
      userInput,
      agentReasoning: 'Waiting for more details from user'
    }
  };
}

function generateReminderWorkflow(userInput: string, input: string): Workflow {
  const steps: WorkflowStep[] = [];
  
  // Parse time/frequency
  const timeMatch = input.match(/(\d+)\s*(am|pm|hour|minute|day|week)/);
  const frequency = input.includes('every') ? 'recurring' : 'once';
  
  // Step 1: Schedule check
  steps.push({
    id: 'step-1',
    type: 'condition',
    title: 'Check Schedule Time',
    description: `Monitor for the scheduled time: ${timeMatch ? timeMatch[0] : 'specified time'}`,
    reasoning: 'This step continuously checks if the current time matches the desired reminder schedule',
    config: {
      frequency,
      time: timeMatch ? timeMatch[0] : '9:00 AM',
      timezone: 'local'
    }
  });

  // Step 2: Trigger notification
  steps.push({
    id: 'step-2',
    type: 'notification',
    title: 'Send Reminder',
    description: 'Deliver the notification to the user',
    reasoning: 'When the scheduled time arrives, this step sends the actual reminder notification',
    config: {
      message: extractReminderMessage(input),
      channels: ['push', 'email']
    },
    dependencies: ['step-1']
  });

  // Step 3: Log completion
  steps.push({
    id: 'step-3',
    type: 'action',
    title: 'Log Event',
    description: 'Record that the reminder was sent',
    reasoning: 'Keeping a log helps track reminder history and debug issues',
    config: {
      action: 'log',
      details: 'Reminder sent successfully'
    },
    dependencies: ['step-2']
  });

  const scheduleTime = timeMatch ? timeMatch[0] : '9:00 AM';
  
  return {
    id: generateId(),
    name: 'Reminder Workflow',
    description: `${frequency === 'recurring' ? 'Recurring' : 'One-time'} reminder notification`,
    domain: 'reminders',
    trigger: {
      type: 'schedule',
      description: `${frequency === 'recurring' ? 'Every day' : 'Once'} at ${scheduleTime}`,
      config: { schedule: scheduleTime, cron: frequency === 'recurring' ? `0 ${scheduleTime}` : undefined }
    },
    steps,
    metadata: {
      createdAt: new Date().toISOString(),
      userInput,
      agentReasoning: `I detected this is a reminder workflow with ${frequency} execution. The workflow monitors for the scheduled time, sends a notification, and logs the event for tracking.`
    }
  };
}

function generateAppSetupWorkflow(userInput: string, input: string): Workflow {
  const steps: WorkflowStep[] = [];
  
  const framework = detectFramework(input);
  
  steps.push({
    id: 'step-1',
    type: 'action',
    title: 'Initialize Project',
    description: `Create new ${framework} project with configuration`,
    reasoning: 'Starting with project initialization ensures we have the correct directory structure and dependencies',
    config: {
      command: `create-${framework}-app`,
      framework
    }
  });

  steps.push({
    id: 'step-2',
    type: 'action',
    title: 'Install Dependencies',
    description: 'Install required packages and tools',
    reasoning: 'Dependencies must be installed before we can configure or run the project',
    config: {
      packages: detectPackages(input)
    },
    dependencies: ['step-1']
  });

  if (input.includes('test') || input.includes('jest') || input.includes('vitest')) {
    steps.push({
      id: 'step-3',
      type: 'action',
      title: 'Configure Testing',
      description: 'Set up testing framework and sample tests',
      reasoning: 'Testing infrastructure is essential for maintainable code',
      config: {
        testFramework: input.includes('vitest') ? 'vitest' : 'jest'
      },
      dependencies: ['step-2']
    });
  }

  steps.push({
    id: 'step-4',
    type: 'action',
    title: 'Start Development Server',
    description: 'Launch the application in development mode',
    reasoning: 'Starting the dev server allows immediate verification that setup was successful',
    config: {
      command: 'npm run dev',
      port: 3000
    },
    dependencies: ['step-2']
  });

  return {
    id: generateId(),
    name: `${framework} Project Setup`,
    description: `Initialize and configure a new ${framework} project`,
    domain: 'app-setup',
    trigger: { type: 'manual', description: 'Run now' },
    steps,
    metadata: {
      createdAt: new Date().toISOString(),
      userInput,
      agentReasoning: `This is a project setup workflow for ${framework}. I've broken it down into logical steps: initialize, install dependencies, configure testing (if requested), and start the dev server. Each step depends on the previous one completing successfully.`
    }
  };
}

function generateNotificationWorkflow(userInput: string, input: string): Workflow {
  const steps: WorkflowStep[] = [];
  
  // Step 1: Validate inputs
  steps.push({
    id: 'step-1',
    type: 'condition',
    title: 'Validate Recipient Info',
    description: 'Check that required recipient information is available',
    reasoning: 'We must validate inputs before attempting to send to prevent errors',
    config: {
      required: ['recipient', 'message']
    }
  });

  // Step 2: Prepare message
  steps.push({
    id: 'step-2',
    type: 'action',
    title: 'Prepare Message',
    description: 'Format and prepare the notification content',
    reasoning: 'Message preparation ensures consistent formatting and includes all necessary information',
    config: {
      template: 'standard',
      includeTimestamp: true
    },
    dependencies: ['step-1']
  });

  // Step 3: Send notification
  steps.push({
    id: 'step-3',
    type: 'notification',
    title: 'Send Notification',
    description: `Send via ${detectChannel(input)}`,
    reasoning: 'This is the main action that delivers the notification to the recipient',
    config: {
      channel: detectChannel(input),
      priority: input.includes('urgent') || input.includes('important') ? 'high' : 'normal'
    },
    dependencies: ['step-2']
  });

  // Step 4: Confirm delivery
  steps.push({
    id: 'step-4',
    type: 'action',
    title: 'Confirm Delivery',
    description: 'Verify the notification was delivered successfully',
    reasoning: 'Delivery confirmation helps track success rate and catch any issues',
    config: {
      retryOnFailure: true,
      maxRetries: 3
    },
    dependencies: ['step-3']
  });

  const eventType = input.includes('when') || input.includes('signup') || input.includes('user') ? 'event' : 'manual';
  const eventDesc = eventType === 'event' ? 'Event: New user signup' : 'Run now';
  
  return {
    id: generateId(),
    name: 'Notification Workflow',
    description: 'Send and track notification delivery',
    domain: 'automation',
    trigger: { type: eventType, description: eventDesc, config: eventType === 'event' ? { event: 'user.signup' } : undefined },
    steps,
    metadata: {
      createdAt: new Date().toISOString(),
      userInput,
      agentReasoning: 'This workflow handles notification delivery with proper validation, formatting, sending, and delivery confirmation. Each step ensures reliability and provides feedback.'
    }
  };
}

function generateGeneralWorkflow(userInput: string, input: string): Workflow {
  const steps: WorkflowStep[] = [];
  
  // Try to extract action verbs
  const actions = extractActions(input);
  
  actions.forEach((action, index) => {
    steps.push({
      id: `step-${index + 1}`,
      type: 'action',
      title: capitalizeFirst(action),
      description: `Execute: ${action}`,
      reasoning: `This step performs the action "${action}" as specified in your workflow description`,
      config: {
        action: action
      },
      dependencies: index > 0 ? [`step-${index}`] : undefined
    });
  });

  if (steps.length === 0) {
    steps.push({
      id: 'step-1',
      type: 'action',
      title: 'Execute Workflow',
      description: userInput,
      reasoning: 'This is a general-purpose workflow step based on your description',
      config: {}
    });
  }

  return {
    id: generateId(),
    name: 'Custom Workflow',
    description: userInput,
    domain: 'general',
    trigger: { type: 'manual', description: 'Run now' },
    steps,
    metadata: {
      createdAt: new Date().toISOString(),
      userInput,
      agentReasoning: `I've created a ${steps.length}-step workflow based on your description. Each step executes sequentially. You can modify or add steps as needed.`
    }
  };
}

// Helper functions
function generateId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function extractReminderMessage(input: string): string {
  // Try to extract message after "to" or about
  const match = input.match(/to (.+?)(\s+at|\s+every|$)/i);
  return match ? match[1].trim() : 'Complete your task';
}

function detectFramework(input: string): string {
  if (input.includes('react')) return 'React';
  if (input.includes('vue')) return 'Vue';
  if (input.includes('angular')) return 'Angular';
  if (input.includes('next')) return 'Next.js';
  if (input.includes('svelte')) return 'Svelte';
  return 'React'; // default
}

function detectPackages(input: string): string[] {
  const packages: string[] = [];
  if (input.includes('typescript') || input.includes('ts')) packages.push('typescript');
  if (input.includes('eslint')) packages.push('eslint');
  if (input.includes('prettier')) packages.push('prettier');
  if (input.includes('tailwind')) packages.push('tailwindcss');
  if (input.includes('jest')) packages.push('jest');
  if (input.includes('vitest')) packages.push('vitest');
  return packages.length > 0 ? packages : ['standard-dependencies'];
}

function detectChannel(input: string): string {
  if (input.includes('email')) return 'email';
  if (input.includes('sms') || input.includes('text')) return 'sms';
  if (input.includes('slack')) return 'slack';
  if (input.includes('push')) return 'push';
  return 'email'; // default
}

function extractActions(input: string): string[] {
  // Simple action extraction - look for verbs
  const actionWords = ['create', 'send', 'check', 'update', 'delete', 'notify', 'process', 'validate', 'transform', 'save', 'load', 'execute'];
  const found: string[] = [];
  
  actionWords.forEach(word => {
    if (input.includes(word)) {
      found.push(word);
    }
  });
  
  return found.length > 0 ? found : ['process'];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
