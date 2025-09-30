# S(ai)m Jr - Frontend Functionality Documentation (Module Integration)

## Overview
S(ai)m Jr is an AI-powered accounting assistant module designed for integration into existing platforms. The module features a conversational UI that guides users through various accounting tasks, from uploading financial data to categorizing transactions and generating reports, without requiring separate authentication.

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Local Storage
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **File Handling**: Native File API with drag-and-drop

## Core Functionality (No Authentication Required)
1. **Conversational Interface**: Chat-based interaction with the AI assistant
2. **File Upload System**: Upload accounting data (bank statements, CoA, contacts)
3. **Multi-step Workflow**: Guided 8-step workflow for processing accounting data
4. **Data Visualization**: Visual representation of processed data
5. **Rule Management**: Create and manage accounting categorization rules
6. **Exception Handling**: Process for managing exceptions and edge cases
7. **Company Management**: Support for multiple companies via company ID parameter
8. **Processing History**: Track and review file processing runs
9. **Responsive Design**: Works across desktop and mobile devices
10. **Module Integration**: Designed for embedding in existing platforms

## Application Architecture

### Module Integration Architecture
\`\`\`
┌─────────────────────────────────────────┐
│          S(ai)m Jr Module               │
├─────────────────────────────────────────┤
│  Next.js App Router                     │
│  ├── Landing Page                       │
│  ├── Workflow Interface (/workflow)     │
│  ├── Company Data Management            │
│  └── Development Tools                  │
├─────────────────────────────────────────┤
│  State Management                       │
│  ├── React Context                      │
│  ├── Local Storage (CompanyStorage)     │
│  └── Chat Session Management            │
├─────────────────────────────────────────┤
│  Core Components                        │
│  ├── ChatPanel (8-step workflow)        │
│  ├── WorkflowSidebar (progress)         │
│  ├── OutputPanel (results display)      │
│  ├── FileUpload (drag-and-drop)         │
│  └── CoaTable, ExceptionHandler, etc.   │
├─────────────────────────────────────────┤
│  UI Foundation                          │
│  ├── shadcn/ui Base Components          │
│  ├── Custom Business Components         │
│  └── Responsive Layout Components       │
└─────────────────────────────────────────┘
\`\`\`

## Screen Categories

### 1. Core Workflow Screens

#### Landing Page (`/`)
**Purpose**: Module introduction and navigation
**Components**:
- Hero section with S(ai)m Jr branding
- Feature highlights and benefits
- Quick start button to workflow
- Integration information

**Features**:
- Responsive design with animations
- Feature cards with icons
- Call-to-action buttons
- Mobile-optimized layout

#### Chat Interface (`/workflow`)
**Purpose**: Main AI interaction and 8-step processing workflow
**Components**:
- Three-panel layout: Sidebar → Chat → Output
- WorkflowSidebar: Progress tracking (8 steps)
- ChatPanel: Conversational AI interface
- OutputPanel: Results and data display

**Features**:
- Real-time message streaming
- File drag-and-drop upload
- Multi-step workflow guidance
- Progress tracking
- Error handling and recovery
- Mobile-responsive chat UI

**8-Step Workflow**:
1. **Company Setup**: Business profile creation
2. **Chart of Accounts**: Account structure setup
3. **Contacts**: Customer/vendor management
4. **Bank Statement Upload**: File processing
5. **Party Mapping**: Contact resolution
6. **Transaction Categorization**: AI-powered sorting
7. **Exception Handling**: Manual review and correction
8. **Report Generation**: Final accounting reports

**Key Chat Components**:
- **Message Bubbles**: User and AI messages with timestamps
- **File Upload Prompts**: Drag-and-drop file upload areas
- **Processing Indicators**: Animated progress bars and spinners
- **Option Buttons**: Quick action buttons for user responses
- **Exception Handling**: Interactive exception resolution
- **Rule Creation**: Step-by-step rule building interface

#### File Upload Interface (Embedded in Chat)
**Purpose**: File processing and validation
**Components**:
- Drag-and-drop upload zones
- File type validation (CSV, XLSX, PDF)
- Upload progress bars
- File preview thumbnails
- Error messaging and validation

**Features**:
- Multiple file format support
- Client-side file validation
- Progress tracking with estimated duration
- File size limits and type checking
- Preview before processing

#### Output Panel (Right Sidebar)
**Purpose**: Display processing results and data
**Components**:
- Chart of Accounts table
- Transaction listings with categorization
- Exception reports and resolution
- Processing history and runs
- Company profile display

**Features**:
- Tabbed content organization
- Search and filter capabilities
- Export functionality (CSV, Excel)
- Real-time updates during processing
- Responsive design for mobile

### 2. Development Tools

#### Sample Data Controls (`/dev`)
**Purpose**: Development and testing utilities
**Components**:
- Sample company data initialization
- Test data loading buttons
- Data reset and cleanup tools
- Mock AI processing controls
- Company data export/import

**Features**:
- One-click test data setup
- Multiple company scenarios
- Processing simulation
- Data persistence testing
- Development workflow acceleration

## Integration Points

### Module Integration
The S(ai)m Jr module is designed for seamless integration into existing platforms:

**URL Parameters**:
- `/workflow?company={id}` - Load specific company workflow
- `/workflow?new=true` - Start new company setup
- `/workflow?step={number}` - Jump to specific workflow step

**Data Persistence**:
- **CompanyStorage**: localStorage-based multi-tenant data management
- **Chat Sessions**: Persistent conversation history per company
- **Processing Runs**: Historical data processing tracking
- **Company Profiles**: Business information and settings

**API Integration Points**:
- File upload endpoints for processing
- Company data CRUD operations
- Transaction categorization services
- Rule management APIs
- Chat session persistence

### Component Architecture

#### ChatPanel (Core Component)
**Purpose**: Orchestrates the 8-step accounting workflow
**Key Features**:
- Step-based conversation flow
- File upload integration
- AI processing simulation
- Exception handling workflow
- Rule creation wizard
- Progress tracking

**State Management**:
```typescript
interface ChatPanelState {
  messages: Message[]
  currentStep: number
  completedSteps: number[]
  companyProfile: CompanyProfile | null
  isProcessing: boolean
  awaitingResponse: boolean
}
```

#### WorkflowSidebar
**Purpose**: Visual progress tracking and navigation
**Features**:
- 8-step progress visualization
- Step completion indicators
- Quick navigation between steps
- Company information display

#### OutputPanel
**Purpose**: Dynamic content display based on workflow step
**Content Types**:
- Company profile information
- Chart of accounts tables
- Transaction listings
- Exception reports
- Processing run history
- Rule management interface

## Component Library

### Core UI Components (shadcn/ui)
- **Button**: Various styles and sizes
- **Input**: Text inputs with validation
- **Card**: Content containers
- **Table**: Data display tables
- **Dialog**: Modal overlays
- **Dropdown**: Selection menus
- **Badge**: Status indicators
- **Progress**: Loading indicators
- **Tabs**: Content organization

### Custom Business Components
- **ChatPanel**: AI conversation interface with 8-step workflow
- **FileUploadPrompt**: Drag-and-drop file upload handling
- **ProcessingIndicator**: Animated progress visualization
- **CoaTable**: Chart of accounts display and editing
- **OutputPanel**: Dynamic results display
- **WorkflowSidebar**: Step navigation and progress
- **ExceptionHandler**: Interactive error resolution
- **RuleCreationWizard**: Step-by-step rule building

### Layout Components
- **WorkflowLayout**: Three-panel chat interface layout
- **PageLayout**: General page structure
- **LoadingStates**: Various loading indicators

## State Management

### React Context Providers
```typescript
// Company Context (No Authentication)
interface CompanyContextType {
  currentCompany: CompanyProfile | null
  companies: CompanyProfile[]
  switchCompany: (companyId: string) => void
  createCompany: (data: CompanyData) => CompanyProfile
}

// Chat Context
interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  currentStep: number
  completedSteps: number[]
  updateStep: (step: number) => void
  isProcessing: boolean
}

// Workflow Context
interface WorkflowContextType {
  outputContent: OutputContent
  setOutputContent: (content: OutputContent) => void
  chatSession: ChatSession | null
  setChatSession: (session: ChatSession) => void
}
```

### Local Storage Management (CompanyStorage)
**Components**:
- Welcome header with user greeting
- Company selector dropdown
- Quick action buttons
- Recent activity feed
- Usage statistics cards
- Navigation tabs

**Features**:
- Multi-company support
- Real-time activity updates
- Responsive grid layout
- Quick access to common tasks
- Visual usage metrics

#### Company Selector (`/dashboard/companies`)
**Purpose**: Multi-tenant company management
**Components**:
- Company cards with metadata
- "Create New Company" button
- Search and filter options
- Company statistics preview
- Last accessed timestamps

**Features**:
- Grid/list view toggle
- Company creation wizard
- Bulk operations
- Export company data
- Delete confirmation modals

#### Token Wallet (`/dashboard/tokens`)
**Purpose**: Token balance and usage tracking
**Components**:
- Current balance display
- Usage history table
- Purchase token button
- Usage analytics charts
- Transaction details

**Features**:
- Real-time balance updates
- Usage trend visualization
- Transaction filtering
- Export usage reports
- Low balance notifications

### 3. Workflow Screens

#### Chat Interface (`/workflow`)
**Purpose**: Main AI interaction and processing workflow
**Components**:
- Chat message history
- Message input with file upload
- Typing indicators
- Processing status displays
- Step progress sidebar
- Output panel

**Features**:
- Real-time message streaming
- File drag-and-drop upload
- Multi-step workflow guidance
- Progress tracking
- Error handling and recovery
- Mobile-responsive chat UI

**Key Chat Components**:
- **Message Bubbles**: User and AI messages with timestamps
- **File Upload Prompts**: Drag-and-drop file upload areas
- **Processing Indicators**: Animated progress bars and spinners
- **Option Buttons**: Quick action buttons for user responses
- **Exception Handling**: Interactive exception resolution
- **Rule Creation**: Step-by-step rule building interface

#### File Upload Interface (Embedded in Chat)
**Purpose**: File processing and validation
**Components**:
- Drag-and-drop upload zones
- File type validation
- Upload progress bars
- File preview thumbnails
- Error messaging

**Features**:
- Multiple file format support (CSV, XLSX, PDF)
- Client-side file validation
- Progress tracking
- File size limits
- Preview before processing

#### Output Panel (Right Sidebar)
**Purpose**: Display processing results and data
**Components**:
- Chart of Accounts table
- Transaction listings
- Exception reports
- Processing history
- Company profile display

**Features**:
- Tabbed content organization
- Search and filter capabilities
- Export functionality
- Real-time updates
- Responsive design

### 4. Company Management Screens

#### Company Setup (`/companies/setup`)
**Purpose**: Initial company configuration
**Components**:
- Business information form
- Industry selection
- Chart of accounts setup
- Contact management
- Settings configuration

**Features**:
- Multi-step setup wizard
- Form validation and error handling
- Progress saving
- Skip optional steps
- Setup completion tracking

#### Chart of Accounts (`/companies/coa`)
**Purpose**: Account structure management
**Components**:
- Hierarchical account tree
- Account creation forms
- Search and filter tools
- Bulk import/export
- Account categorization

**Features**:
- Drag-and-drop reordering
- Nested account structures
- Account type validation
- Bulk operations
- Template selection

#### Processing History (`/companies/history`)
**Purpose**: Historical processing run management
**Components**:
- Processing run timeline
- Run details modal
- Status indicators
- Performance metrics
- Error logs

**Features**:
- Chronological listing
- Detailed run information
- Status filtering
- Performance analytics
- Error investigation tools

### 5. Admin Screens

#### Admin Dashboard (`/admin`)
**Purpose**: System administration and monitoring
**Components**:
- System health indicators
- User activity metrics
- Performance dashboards
- Alert notifications
- Quick action panels

**Features**:
- Real-time monitoring
- Alert management
- System status overview
- Performance metrics
- Administrative shortcuts

#### User Management (`/admin/users`)
**Purpose**: User account administration
**Components**:
- User listing table
- User detail modals
- Role assignment
- Activity logs
- Bulk operations

**Features**:
- Advanced filtering
- User search
- Role-based permissions
- Activity tracking
- Account management

## Component Library

### Core UI Components (shadcn/ui)
- **Button**: Various styles and sizes
- **Input**: Text inputs with validation
- **Card**: Content containers
- **Table**: Data display tables
- **Modal/Dialog**: Overlay content
- **Dropdown**: Selection menus
- **Badge**: Status indicators
- **Progress**: Loading indicators
- **Avatar**: User profile images
- **Tabs**: Content organization

### Custom Business Components
- **ChatPanel**: AI conversation interface
- **FileUploadPrompt**: File upload handling
- **ProcessingIndicator**: Progress visualization
- **CoaTable**: Chart of accounts display
- **OutputPanel**: Results display
- **WorkflowSidebar**: Step navigation
- **CompanySelector**: Multi-tenant selection
- **ExceptionHandler**: Error resolution interface

### Layout Components
- **DashboardHeader**: Top navigation
- **Sidebar**: Side navigation
- **PageLayout**: Page structure
- **AuthLayout**: Authentication pages
- **WorkflowLayout**: Chat interface layout

## State Management

### React Context Providers
\`\`\`typescript
// Authentication Context
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

// Company Context
interface CompanyContextType {
  currentCompany: CompanyProfile | null
  companies: CompanyProfile[]
  switchCompany: (companyId: string) => void
  createCompany: (data: CompanyData) => CompanyProfile
}

// Chat Context
interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  currentStep: number
  completedSteps: number[]
  updateStep: (step: number) => void
}
\`\`\`

### Local Storage Management
\`\`\`typescript
// Company Storage
class CompanyStorage {
  static saveCompanyProfile(profile: CompanyProfile): void
  static getCompanyProfile(id?: string): CompanyProfile | null
  static getAllUserCompanyProfiles(userId: string): CompanyProfile[]
  static deleteCompany(companyId: string): void
  static exportCompanyData(companyId: string): CompanyExport
}

// Chat Session Storage
class ChatStorage {
  static saveChatSession(session: ChatSession): void
  static getChatSession(companyId: string): ChatSession | null
  static clearChatHistory(companyId: string): void
}
\`\`\`

## User Experience Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablets
- **Desktop Enhancement**: Full feature set on desktop
- **Touch-Friendly**: Large touch targets and gestures

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Support for high contrast modes
- **Focus Management**: Proper focus handling
- **Alternative Text**: Images with descriptive alt text

### Performance Optimizations
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Efficient caching implementation

### Animation and Interactions
- **Framer Motion**: Smooth page transitions
- **Loading States**: Engaging loading animations
- **Micro-interactions**: Button hover effects
- **Progress Indicators**: Visual progress feedback
- **Gesture Support**: Touch gestures on mobile

## Data Flow

### Frontend Data Flow
\`\`\`
User Interaction
    ↓
Component Event Handler
    ↓
Context State Update
    ↓
Local Storage Persistence
    ↓
UI Re-render
    ↓
Visual Feedback to User
\`\`\`

### File Processing Flow
\`\`\`
File Selection/Drop
    ↓
Client-side Validation
    ↓
File Preview Generation
    ↓
Upload Progress Tracking
    ↓
Processing Status Updates
    ↓
Results Display
\`\`\`

## Error Handling

### Error Boundaries
- **Global Error Boundary**: Catches unhandled errors
- **Route Error Boundaries**: Page-specific error handling
- **Component Error Boundaries**: Component-level error isolation

### User-Friendly Error Messages
- **Validation Errors**: Clear field-specific messages
- **Network Errors**: Retry mechanisms and offline support
- **File Errors**: Specific file-related error guidance
- **Processing Errors**: Step-by-step error resolution

### Error Recovery
- **Automatic Retry**: For transient errors
- **Manual Retry**: User-initiated retry options
- **Fallback UI**: Graceful degradation
- **Error Reporting**: Optional error reporting to improve UX

## Testing Strategy

### Component Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Visual Tests**: Screenshot comparison testing
- **Accessibility Tests**: A11y compliance testing

### User Flow Testing
- **E2E Tests**: Complete user journey testing
- **Cross-browser Testing**: Multiple browser support
- **Mobile Testing**: Touch and gesture testing
- **Performance Testing**: Load time and interaction testing

## Deployment and Build

### Build Configuration
\`\`\`javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  experimental: {
    appDir: true,
  },
}
\`\`\`

### Environment Configuration
\`\`\`bash
# Frontend Environment Variables
NEXT_PUBLIC_APP_NAME=Saim Jr
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
\`\`\`

### Static Asset Optimization
- **Image Optimization**: WebP format with fallbacks
- **Font Optimization**: Preloaded custom fonts
- **CSS Optimization**: Purged unused styles
- **JavaScript Optimization**: Minified and compressed

This documentation provides a comprehensive overview of the Saim Jr frontend application, focusing on user interface components, screen functionality, and user experience features without any backend dependencies.
