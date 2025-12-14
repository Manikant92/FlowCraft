# ✨ Flowcraft - Craft workflows with words

An intelligent workflow creation platform that converts natural language descriptions into structured, executable workflows with transparent AI reasoning.

## 🎯 Overview

This is a **hackathon MVP** that demonstrates an agent-driven workflow builder. Unlike full automation platforms like Zapier or n8n, this focuses on **explainability and orchestration** - showing *why* each workflow step exists and how the agent reasoned about the workflow structure.

## ✨ Features

- **Natural Language Input**: Describe workflows in plain English
- **AI Agent Reasoning**: See transparent explanations for each workflow step
- **Structured Workflow Generation**: Converts descriptions to JSON workflow schemas
- **Visual Workflow Display**: Clear visualization of workflow steps and dependencies
- **Simulation Engine**: Execute and test workflows with real-time logs
- **Domain Detection**: Automatically detects workflow types (reminders, automation, app setup)
- **Clarifying Questions**: Agent asks for more details when input is ambiguous

## 🏗️ Architecture

```
┌─────────────────┐
│  User Input     │ (Natural Language)
│  "Send me a     │
│  reminder..."   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Workflow Generator Agent   │
│  - Pattern matching         │
│  - Domain detection         │
│  - Step decomposition       │
│  - Reasoning generation     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Structured Workflow (JSON) │
│  - Steps                    │
│  - Dependencies             │
│  - Configuration            │
│  - Agent reasoning          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Visualization & Execution  │
│  - Step-by-step display     │
│  - Execution simulation     │
│  - Real-time logs           │
└─────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Examples

### 1. Reminder Workflow
```
Input: "Send me a reminder every morning at 9am to review my tasks"

Output:
- Check Schedule Time (condition)
- Send Reminder (notification)
- Log Event (action)
```

### 2. App Setup Workflow
```
Input: "Set up a new React project with TypeScript and testing"

Output:
- Initialize Project (action)
- Install Dependencies (action)
- Configure Testing (action)
- Start Development Server (action)
```

### 3. Notification Workflow
```
Input: "Send an email notification when a new user signs up"

Output:
- Validate Recipient Info (condition)
- Prepare Message (action)
- Send Notification (notification)
- Confirm Delivery (action)
```

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: Cline CLI + API Routes
- **Deployment**: Vercel-ready
- **CLI**: Built on Cline automation principles

## ⚡ CLI Automation with Cline

This project demonstrates **Cline-powered CLI automation** as the core engine. The web app is simply a UI layer that invokes the CLI.

### Architecture

```
User Input (Web/CLI)
         │
         ▼
  ┌──────────────────┐
  │   Cline CLI      │  ◄── Source of Truth
  │   Agent Engine   │
  └────────┬─────────┘
           │
           ├─── Generate Workflows
           ├─── Execute Workflows  
           └─── Explain Reasoning
           │
           ▼
    Structured Output
```

### CLI Commands

The CLI tool is the **primary interface** for workflow automation:

```bash
# Create a workflow from natural language
npm run workflow create "Send me a reminder every morning at 9am"

# Execute the last workflow
npm run workflow run last

# Explain workflow reasoning
npm run workflow explain last
```

### Usage Examples

**1. Create a Reminder Workflow**
```bash
$ npm run workflow create "Send me a reminder every day at 3pm to drink water"

🤖 Cline CLI Agent: Analyzing workflow description...
✅ Workflow generated: Reminder Workflow
📊 Domain: reminders
🔢 Steps: 3

🧠 Agent Reasoning:
I detected this is a reminder workflow with recurring execution...

📝 Workflow Steps:
  1. Check Schedule Time (condition)
     └─ Monitor for the scheduled time: 3pm
  2. Send Reminder (notification)
     └─ Deliver the notification to the user
  3. Log Event (action)
     └─ Record that the reminder was sent

💾 Workflow saved: wf-1734176345-abc123def
```

**2. Execute a Workflow**
```bash
$ npm run workflow run last

🤖 Cline CLI Agent: Loading workflow...
📂 Loaded last workflow
▶️  Executing: Reminder Workflow

🔄 Step 1: Check Schedule Time - RUNNING
✅ Step 1: Check Schedule Time - COMPLETED
   ✓ Condition evaluated: Check Schedule Time
   Result: true

🔄 Step 2: Send Reminder - RUNNING
✅ Step 2: Send Reminder - COMPLETED
   ✓ Notification sent: Send Reminder
   Channel: push
   Message: drink water

✅ Step 3: Log Event - COMPLETED

🎯 Execution COMPLETED
⏱️  Duration: 3.21s
```

**3. Explain Workflow Reasoning**
```bash
$ npm run workflow explain last

🤖 Cline CLI Agent: Loading workflow explanation...

📋 Workflow: Reminder Workflow
🏷️  Domain: reminders

🧠 Overall Agent Reasoning:
I detected this is a reminder workflow with recurring execution...

💭 Step-by-Step Reasoning:

Step 1: Check Schedule Time
Type: condition
Description: Monitor for the scheduled time: 3pm

Agent Reasoning:
  "This step continuously checks if the current time matches the desired reminder schedule"

What the agent inferred:
  - This is a condition step
  - It monitor for the scheduled time: 3pm
  - No dependencies (can run immediately)

---
```

### How the Web App Uses the CLI

The web application **internally invokes the Cline CLI** for all workflow operations:

```typescript
// app/api/generate/route.ts
import { createWorkflow } from '@/cli/workflow-agent';

export async function POST(request: NextRequest) {
  const { userInput } = await request.json();
  
  // Invoke Cline CLI Agent programmatically
  const cliResult = await createWorkflow(userInput);
  
  return NextResponse.json({
    workflow: cliResult.data,
    cliLogs: cliResult.logs  // CLI output
  });
}
```

**Key Principle**: The CLI is the source of truth. The web UI simply presents CLI results in a visual format.

### Why This Architecture?

1. **Separation of Concerns**: Core logic in CLI, presentation in UI
2. **Testability**: CLI can be tested independently
3. **Flexibility**: Can be used standalone or via web interface
4. **Transparency**: See exactly what the agent is doing via CLI logs
5. **Cline Principles**: Follows Cline's automation-first philosophy

### CLI Development

The CLI is built following Cline automation principles:

- **Deterministic**: Same input always produces same workflow
- **Explainable**: Every decision has clear reasoning
- **Modular**: Separate create/run/explain commands
- **Stateful**: Workflows saved to `.workflows/` directory
- **TypeScript**: Type-safe CLI implementation

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # Workflow generation API
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main UI page
│   └── globals.css             # Global styles
├── components/
│   ├── WorkflowVisualizer.tsx  # Workflow step visualization
│   └── ExecutionLog.tsx        # Execution log display
├── lib/
│   ├── workflowGenerator.ts    # AI agent logic
│   └── workflowExecutor.ts     # Simulation engine
├── types/
│   └── workflow.ts             # TypeScript definitions
└── README.md
```

## 🧠 How the Agent Works

The workflow generator agent uses:

1. **Pattern Matching**: Detects keywords to identify workflow domain
2. **Template-Based Generation**: Uses domain-specific templates for common workflows
3. **Step Decomposition**: Breaks workflows into logical, dependent steps
4. **Reasoning Generation**: Explains *why* each step exists
5. **Clarification Logic**: Asks questions when input is too vague

In production, this would be powered by an LLM (OpenAI, Anthropic, etc.) for more sophisticated generation.

## 🔮 Future Enhancements

- [ ] LLM integration (OpenAI/Anthropic API)
- [ ] Drag-and-drop workflow editor
- [ ] Real workflow execution (not simulated)
- [ ] Workflow templates library
- [ ] User authentication and saved workflows
- [ ] Export workflows to code
- [ ] Integration with external APIs
- [ ] Complex DAG support with parallel execution

## 🎥 Demo

This app is designed for a **2-minute video demo** showcasing:

1. Natural language input
2. AI reasoning explanation
3. Visual workflow display
4. Execution with live logs
5. Different workflow types

## 📦 Deployment

### Deploy to Vercel (Recommended)

**Method 1: GitHub Integration (Easiest)**
1. Push your code to a GitHub repository
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js and deploy!

**Method 2: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Production Build Check

Before deploying, ensure the build works:

```bash
npm run build
npm start
```

### Environment Variables

No environment variables required for the MVP! The app works out of the box.

### Live Demo

🚀 **Deployed on Vercel**: [Your-Demo-Link-Here]

(Add your Vercel deployment URL after deploying)

## � Contributing

This is a hackathon project. Feel free to fork and extend!

## 📄 License

MIT License

## � Acknowledgments

Built for the WeMakeDev AssembleAll Hackathon 2025.

---

**Note**: This is an MVP focusing on workflow orchestration and explainability, not a full automation platform. The execution is simulated for demonstration purposes.
