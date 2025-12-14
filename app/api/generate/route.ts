// API endpoint for generating workflows - Powered by Cline CLI
import { NextRequest, NextResponse } from 'next/server';
import { createWorkflow } from '@/cli/workflow-agent';

/**
 * This API route invokes the Cline CLI automation layer internally.
 * The CLI is the source of truth for workflow generation logic.
 * The web app is simply a UI layer that invokes CLI commands.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: userInput is required' },
        { status: 400 }
      );
    }

    // Invoke Cline CLI Agent programmatically
    const cliResult = await createWorkflow(userInput);

    if (!cliResult.success) {
      return NextResponse.json({
        workflow: cliResult.data || { steps: [] },
        clarificationNeeded: true,
        clarificationQuestion: cliResult.error,
        cliLogs: cliResult.logs
      });
    }

    return NextResponse.json({
      workflow: cliResult.data,
      cliLogs: cliResult.logs
    });
  } catch (error) {
    console.error('Error invoking CLI:', error);
    return NextResponse.json(
      { error: 'Failed to generate workflow via CLI' },
      { status: 500 }
    );
  }
}
