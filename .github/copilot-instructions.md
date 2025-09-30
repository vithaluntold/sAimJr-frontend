# S(ai)m Jr - AI Copilot Instructions

## Project Overview
S(ai)m Jr is an AI-powered accounting assistant module built with Next.js 14, featuring a conversational chat interface for processing accounting data. Designed for integration into existing platforms, it follows a multi-step workflow where users upload financial data, and AI categorizes transactions while handling exceptions.

## Architecture Patterns

### Core Structure
- **Modular architecture** built with Next.js App Router for easy integration
- **Three-panel layout**: `WorkflowSidebar` (steps) → `ChatPanel` (conversation) → `OutputPanel` (results)
- **State management**: React Context + localStorage for persistence
- **Component library**: shadcn/ui with custom business components
- **Self-contained**: No external auth dependencies, expects user context from parent platform

### Key Components
- `ChatPanel`: Orchestrates the main conversation flow with step-based logic
- `OutputPanel`: Displays different content types (`coa`, `transactions`, `exceptions`, etc.)
- `WorkflowSidebar`: Shows 8-step progress (Company Setup → Report Generation)
- `CompanyStorage`: Manages multi-tenant data persistence in localStorage

## Development Conventions

### File Organization
```
components/
  ├── ui/ (shadcn/ui base components)
  └── [business-components] (CoaTable, ChatPanel, OutputPanel, WorkflowSidebar)
lib/
  ├── types.ts (central type definitions)
  ├── company-storage.ts (localStorage management)
  └── sample-data.ts (mock data for testing)
```

### TypeScript Patterns
- Use `interface` for data structures (see `lib/types.ts`)
- Props interfaces follow `ComponentNameProps` pattern
- Extensive type safety with union types for state machines (`OutputContentType`)

### State Management
- **Messages**: Array of `Message` objects with sender, componentType, and processing states
- **Company data**: Persisted per company ID in localStorage via `CompanyStorage`
- **Chat sessions**: Linked to companies with step tracking and message history

## Key Integration Points

### Chat System Architecture
The chat follows a state machine pattern:
1. **Message types**: `"user" | "saim"` with optional `componentType` for UI components
2. **Step-based flow**: 8 predefined steps with completion tracking
3. **Processing states**: Messages can have `isProcessing: true` with duration estimates
4. **File uploads**: Embedded as chat components with drag-and-drop

### Data Patterns
- **Multi-tenancy**: All data scoped by `companyId`
- **Type-safe outputs**: Use `OutputContentType` union for panel content
- **Exception handling**: Structured `TransactionException` objects for user resolution
- **Processing runs**: Each bank statement upload creates a `ProcessingRun` record

## Development Workflow

### Commands
```bash
pnpm dev          # Development server
pnpm build        # Production build  
pnpm lint         # ESLint checking
```

### Component Creation
- Use shadcn/ui as base: `npx shadcn-ui@latest add [component]`
- Business components extend UI components with domain logic
- Follow the `export function ComponentName({ prop }: ComponentNameProps)` pattern

### Adding New Steps
1. Update `WORKFLOW_STEPS` array in `ChatPanel`
2. Add step logic in `handleOptionClick` switch statement
3. Define new `OutputContentType` if needed
4. Update `CompanyStorage` for persistence

## Testing Approach
- **Sample data**: Use `lib/sample-data.ts` for realistic test data
- **Mock processing**: Simulate AI operations with timeouts and sample outputs
- **Error simulation**: Components include error state handling
- **File validation**: Client-side validation before "processing"

## Security Notes
- **Input validation**: Zod schemas for form validation
- **File safety**: Client-side file type and size validation
- **Data isolation**: All data scoped by `companyId` for multi-tenancy

## Common Patterns
- **Conditional rendering**: Use early returns for loading/error states
- **Event handlers**: Prefix with `handle` (e.g., `handleStepComplete`)
- **Async operations**: Wrap in try-catch with proper error state updates  
- **Type guards**: Use union types with discriminated properties for type safety
- **Component composition**: Prefer composition over inheritance for UI flexibility