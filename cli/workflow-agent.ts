#!/usr/bin/env node

/**
 * Workflow Agent CLI - Powered by Cline CLI Automation
 * 
 * This CLI tool is the core automation engine that powers the workflow builder.
 * The web app invokes these CLI commands to maintain a clear separation:
 * - CLI = Source of truth for workflow logic
 * - Web App = UI layer that invokes CLI
 */

import { generateWorkflow } from '../lib/workflowGenerator';
import { executeWorkflow } from '../lib/workflowExecutor';
import { Workflow, WorkflowExecution } from '../types/workflow';
import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS_DIR = path.join(process.cwd(), '.workflows');
const LAST_WORKFLOW_FILE = path.join(WORKFLOWS_DIR, 'last.json');

// Ensure workflows directory exists
if (!fs.existsSync(WORKFLOWS_DIR)) {
  fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
}

interface CLIResult {
  success: boolean;
  data?: any;
  error?: string;
  logs?: string[];
}

/**
 * Create a new workflow from natural language
 */
async function createWorkflow(description: string): Promise<CLIResult> {
  const logs: string[] = [];
  
  try {
    logs.push('🤖 Cline CLI Agent: Analyzing workflow description...');
    
    const result = generateWorkflow(description);
    
    if (result.clarificationNeeded) {
      logs.push('⚠️  Clarification needed');
      return {
        success: false,
        error: result.clarificationQuestion,
        logs
      };
    }
    
    const workflow = result.workflow;
    
    logs.push(`✅ Workflow generated: ${workflow.name}`);
    logs.push(`📊 Domain: ${workflow.domain}`);
    logs.push(`🔢 Steps: ${workflow.steps.length}`);
    logs.push('');
    logs.push('🧠 Agent Reasoning:');
    logs.push(workflow.metadata.agentReasoning);
    logs.push('');
    logs.push('📝 Workflow Steps:');
    
    workflow.steps.forEach((step, idx) => {
      logs.push(`  ${idx + 1}. ${step.title} (${step.type})`);
      logs.push(`     └─ ${step.description}`);
    });
    
    // Save workflow
    const workflowPath = path.join(WORKFLOWS_DIR, `${workflow.id}.json`);
    fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
    fs.writeFileSync(LAST_WORKFLOW_FILE, JSON.stringify(workflow, null, 2));
    
    logs.push('');
    logs.push(`💾 Workflow saved: ${workflow.id}`);
    
    return {
      success: true,
      data: workflow,
      logs
    };
  } catch (error) {
    logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs
    };
  }
}

/**
 * Execute a workflow
 */
async function runWorkflow(workflowIdOrLast: string): Promise<CLIResult> {
  const logs: string[] = [];
  
  try {
    logs.push('🤖 Cline CLI Agent: Loading workflow...');
    
    let workflow: Workflow;
    
    if (workflowIdOrLast === 'last') {
      if (!fs.existsSync(LAST_WORKFLOW_FILE)) {
        throw new Error('No workflow found. Create one first with: workflow-agent create');
      }
      workflow = JSON.parse(fs.readFileSync(LAST_WORKFLOW_FILE, 'utf-8'));
      logs.push('📂 Loaded last workflow');
    } else {
      const workflowPath = path.join(WORKFLOWS_DIR, `${workflowIdOrLast}.json`);
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow not found: ${workflowIdOrLast}`);
      }
      workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      logs.push(`📂 Loaded workflow: ${workflowIdOrLast}`);
    }
    
    logs.push(`▶️  Executing: ${workflow.name}`);
    logs.push('');
    
    const execution = await new Promise<WorkflowExecution>((resolve) => {
      executeWorkflow(workflow, (exec) => {
        // Log each step's status change
        exec.logs.forEach((log, idx) => {
          const stepNum = idx + 1;
          if (log.status === 'running') {
            logs.push(`🔄 Step ${stepNum}: ${log.stepTitle} - RUNNING`);
          } else if (log.status === 'completed') {
            logs.push(`✅ Step ${stepNum}: ${log.stepTitle} - COMPLETED`);
            if (log.output) {
              logs.push(`   ${log.output.split('\n').join('\n   ')}`);
            }
          } else if (log.status === 'failed') {
            logs.push(`❌ Step ${stepNum}: ${log.stepTitle} - FAILED`);
            if (log.error) {
              logs.push(`   Error: ${log.error}`);
            }
          }
        });
        
        if (exec.status === 'completed' || exec.status === 'failed') {
          resolve(exec);
        }
      });
    });
    
    logs.push('');
    logs.push(`🎯 Execution ${execution.status.toUpperCase()}`);
    logs.push(`⏱️  Duration: ${calculateDuration(execution.startTime, execution.endTime)}`);
    
    return {
      success: execution.status === 'completed',
      data: execution,
      logs
    };
  } catch (error) {
    logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs
    };
  }
}

/**
 * Explain a workflow's reasoning
 */
async function explainWorkflow(workflowIdOrLast: string): Promise<CLIResult> {
  const logs: string[] = [];
  
  try {
    logs.push('🤖 Cline CLI Agent: Loading workflow explanation...');
    
    let workflow: Workflow;
    
    if (workflowIdOrLast === 'last') {
      if (!fs.existsSync(LAST_WORKFLOW_FILE)) {
        throw new Error('No workflow found. Create one first with: workflow-agent create');
      }
      workflow = JSON.parse(fs.readFileSync(LAST_WORKFLOW_FILE, 'utf-8'));
    } else {
      const workflowPath = path.join(WORKFLOWS_DIR, `${workflowIdOrLast}.json`);
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow not found: ${workflowIdOrLast}`);
      }
      workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
    }
    
    logs.push('');
    logs.push(`📋 Workflow: ${workflow.name}`);
    logs.push(`🏷️  Domain: ${workflow.domain}`);
    logs.push('');
    logs.push('🧠 Overall Agent Reasoning:');
    logs.push(workflow.metadata.agentReasoning);
    logs.push('');
    logs.push('💭 Step-by-Step Reasoning:');
    logs.push('');
    
    workflow.steps.forEach((step, idx) => {
      logs.push(`Step ${idx + 1}: ${step.title}`);
      logs.push(`Type: ${step.type}`);
      logs.push(`Description: ${step.description}`);
      logs.push('');
      logs.push('Agent Reasoning:');
      logs.push(`  "${step.reasoning}"`);
      logs.push('');
      logs.push('What the agent inferred:');
      logs.push(`  - This is a ${step.type} step`);
      logs.push(`  - It ${step.description.toLowerCase()}`);
      if (step.dependencies && step.dependencies.length > 0) {
        const depNames = step.dependencies.map(depId => {
          const dep = workflow.steps.find(s => s.id === depId);
          return dep ? dep.title : depId;
        });
        logs.push(`  - Depends on: ${depNames.join(', ')}`);
      } else {
        logs.push(`  - No dependencies (can run immediately)`);
      }
      logs.push('');
      logs.push('---');
      logs.push('');
    });
    
    return {
      success: true,
      data: workflow,
      logs
    };
  } catch (error) {
    logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs
    };
  }
}

function calculateDuration(start?: string, end?: string): string {
  if (!start || !end) return '-';
  const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
  return `${duration.toFixed(2)}s`;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('🤖 Workflow Agent CLI - Powered by Cline Automation\n');
    console.log('Usage:');
    console.log('  workflow-agent create "<description>"   Create a new workflow');
    console.log('  workflow-agent run <id|last>            Execute a workflow');
    console.log('  workflow-agent explain <id|last>        Show workflow reasoning');
    console.log('\nExamples:');
    console.log('  workflow-agent create "Send me a reminder every morning at 9am"');
    console.log('  workflow-agent run last');
    console.log('  workflow-agent explain last');
    process.exit(0);
  }
  
  let result: CLIResult;
  
  switch (command) {
    case 'create':
      const description = args[1];
      if (!description) {
        console.error('❌ Error: Description required');
        console.log('Usage: workflow-agent create "<description>"');
        process.exit(1);
      }
      result = await createWorkflow(description);
      break;
      
    case 'run':
      const workflowId = args[1] || 'last';
      result = await runWorkflow(workflowId);
      break;
      
    case 'explain':
      const explainId = args[1] || 'last';
      result = await explainWorkflow(explainId);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
  
  // Print all logs
  result.logs?.forEach(log => console.log(log));
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

// Export functions for programmatic use by web app
export { createWorkflow, runWorkflow, explainWorkflow };

// Run CLI if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
