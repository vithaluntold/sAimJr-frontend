# S(ai)m Jr - Screen Specifications (Module Integration)

## Core Module Screens

### Landing Page (`/`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  Header: S(ai)m Jr Logo                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Hero Section                         │   │
│  │           AI-Powered Accounting                     │   │
│  │           Assistant Module                          │   │
│  │                                                     │   │
│  │           [  Start Workflow  ]                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐   │
│  │Feature │Feature │Feature │Feature │Feature │Feature │   │
│  │   1    │   2    │   3    │   4    │   5    │   6    │   │
│  └────────┴────────┴────────┴────────┴────────┴────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              How It Works                           │   │
│  │  Step-by-step workflow explanation                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Component Specifications
- **Container**: Full-width responsive layout
- **Hero Section**: 
  - S(ai)m Jr branding with gradient background
  - Feature highlight text
  - Call-to-action button to workflow
- **Feature Cards**: 
  - 6 key features with icons
  - Responsive grid layout
  - Hover animations
- **Workflow Steps**: 
  - Visual representation of 8-step process
  - Progressive disclosure

### Workflow Interface (`/workflow`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      Header                                 │
├──────────────┬─────────────────────────┬──────────────────┤
│              │                         │                  │
│   Workflow   │       Chat Panel        │   Output Panel   │
│   Sidebar    │                         │                  │
│              │                         │                  │
│ ┌──────────┐ │ ┌─────────────────────┐ │ ┌──────────────┐ │
│ │ Step 1   │ │ │                     │ │ │              │ │
│ │ ✓ Setup  │ │ │    Chat Messages    │ │ │   Results    │ │
│ │          │ │ │                     │ │ │   Display    │ │
│ │ Step 2   │ │ │                     │ │ │              │ │
│ │   CoA    │ │ │                     │ │ │              │ │
│ │          │ │ │                     │ │ │              │ │
│ │ Step 3   │ │ └─────────────────────┘ │ │              │ │
│ │ Contacts │ │                         │ │              │ │
│ │          │ │ ┌─────────────────────┐ │ │              │ │
│ │ Step 4   │ │ │   Message Input     │ │ │              │ │
│ │  Upload  │ │ │  [_____________]    │ │ │              │ │
││ ...       │ │ │  [📎] [Send]        │ │ │              │ │
│ └──────────┘ │ └─────────────────────┘ │ └──────────────┘ │
│              │                         │                  │
└──────────────┴─────────────────────────┴──────────────────┘
\`\`\`

#### Component Specifications

**WorkflowSidebar** (250px width):
- 8 workflow steps with progress indicators
- Company information display
- Step navigation
- Completion checkmarks

**ChatPanel** (flexible center):
- Message history with scrollable container
- AI and user message bubbles
- File upload drag-and-drop zones
- Processing indicators
- Option buttons for user actions
- Message input with file attachment

**OutputPanel** (350px width):
- Tabbed content display
- Dynamic content based on workflow step
- Data tables (CoA, transactions, etc.)
- Export functionality
- Search and filter controls

#### State Management
\`\`\`typescript
interface WorkflowState {
  currentStep: number
  completedSteps: number[]
  messages: Message[]
  companyProfile: CompanyProfile | null
  outputContent: {
    type: OutputContentType
    data: unknown
  }
  isProcessing: boolean
}
\`\`\`

#### API Interactions
- **GET `/api/companies/{id}`**: Load company data
- **POST `/api/companies`**: Create new company
- **POST `/api/files/upload`**: Upload and process files
- **GET `/api/transactions`**: Retrieve transaction data
- **POST `/api/rules`**: Create categorization rules

### Development Tools (`/dev`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              Development Controls                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Sample Data Controls                     │   │
│  │                                                     │   │
│  │  [Initialize Sample Data]  [Clear All Data]        │   │
│  │                                                     │   │
│  │  Companies: 3 test companies loaded                 │   │
│  │  Status: Ready for testing                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Instructions                           │   │
│  │  1. Click "Initialize Sample Data" to load tests   │   │
│  │  2. Navigate to /workflow to test workflow         │   │
│  │  3. Use company selector to switch contexts        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`
  - Logo
  - Navigation menu
  - User menu
  - Token balance display
- **Activity Summary Cards**: 
  - Quick overview of recent activities
- **Recent Processing History**: 
  - List of recent processing tasks
- **Quick Action Buttons**: 
  - Buttons for common actions
- **Usage Statistics**: 
  - Graphs and charts showing usage trends

#### State Management
\`\`\`typescript
interface DashboardState {
  userProfile: any
  companies: any[]
  processingStats: any
  loading: boolean
  error: string | null
}
\`\`\`

#### API Interactions
- **GET `/api/user/profile`**: Fetch user profile data
- **GET `/api/companies`**: Fetch list of companies
- **GET `/api/dashboard/stats`**: Fetch usage statistics

## Workflow Screens

### Chat Interface (`/workflow`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Sidebar          │ Chat Panel                    │ Output Panel                │
│ ┌─────────────┐  │ ┌─────────────────────────┐   │ ┌─────────────────────────┐ │
│ │ S(ai)m Jr   │  │ │ Chat with S(ai)m Jr     │   │ │ Chart of Accounts       │ │
│ │ Acme Corp   │  │ │ Step 2: Chart of Accounts│   │ │                         │ │
│ │             │  │ └─────────────────────────┘   │ │ Search: [_________] 🔍  │ │
│ │ ✓ Profile   │  │                               │ │                         │ │
│ │ ● COA       │  │ [Chat Messages Area]          │ │ Code | Name | Category  │ │
│ │ ○ Contacts  │  │                               │ │ 1000 | Cash | Assets    │ │
│ │ ○ Bank Stmt │  │ ┌─────────────────────────┐   │ │ 1100 | A/R  | Assets    │ │
│ │ ○ Map       │  │ │ S(ai)m: Great! Now      │   │ │ 2000 | A/P  | Liab.     │ │
│ │ ○ Categorize│  │ │ let's set up your       │   │ │ 4000 | Revenue | Rev.    │ │
│ │ ○ Exceptions│  │ │ Chart of Accounts.      │   │ │                         │ │
│ │ ○ Report    │  │ │ [Generate COA]          │   │ │ [↻] [↓] Download        │ │
│ │             │  │ │ [Upload COA]            │   │ │                         │ │
│ └─────────────┘  │ └─────────────────────────┘   │ └─────────────────────────┘ │
│                  │                               │                             │
│                  │ ┌─────────────────────────┐   │                             │
│                  │ │ Type your message...    │   │                             │
│                  │ │ [📎] [🎤]          [➤] │   │                             │
│                  │ └─────────────────────────┘   │                             │
└─────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Component Specifications
- **WorkflowSidebar**: 
  - Shows progress steps
- **ChatPanel**: 
  - Interaction with AI
  - Message types: S(ai)m messages, User messages, System messages
- **FileUploadWithProgress**: 
  - Upload Chart of Accounts
  - CSV or XLSX format with Account Code, Name, Category
  - Drag & drop or browse file options
  - Download Sample COA link
  - Upload File button
  - Skip for now button
- **OutputPanel**: 
  - Displays results
  - Chart of Accounts view
  - Transaction view
  - Exception Handling view
- **ProcessingIndicator**: 
  - Shows AI activity
  - Progress bar
  - Estimated time remaining

#### State Management
\`\`\`typescript
interface WorkflowState {
  currentStep: number
  chatHistory: any[]
  processingStatus: string
  outputData: any
  loading: boolean
  error: string | null
}
\`\`\`

#### API Interactions
- **WebSocket connection**: Real-time communication with AI
- **POST `/api/files/upload`**: Upload files
- **POST `/api/workflow/process`**: Process workflow steps
- **GET `/api/workflow/status`**: Fetch workflow status

## Settings Screen (`/settings`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────┐
│              Header Logo                │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────────────────────────────┐      │
│    │       Profile Settings      │      │
│    │                            │      │
│    │  Name: [_______]           │      │
│    │  Email: [_____________]    │      │
│    │  Phone: [__________]      │      │
│    │                            │      │
│    │  [  Save Changes  ]        │      │
│    │                            │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │       Security Settings     │      │
│    │                            │      │
│    │  Password: [__________]    │      │
│    │  MFA: [__________]         │      │
│    │                            │      │
│    │  [  Update Security  ]      │      │
│    │                            │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │   Notification Preferences  │      │
│    │                            │      │
│    │  Email Notifications: [On] │      │
│    │  SMS Notifications: [Off]  │      │
│    │                            │      │
│    │  [  Save Preferences  ]     │      │
│    │                            │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │   Subscription Management   │      │
│    │                            │      │
│    │  Current Plan: [Basic]      │      │
│    │  Upgrade to Premium: [Button]│      │
│    │                            │      │
│    │  [  Manage Subscription  ]  │      │
│    │                            │      │
│    └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

#### Component Specifications
- **Profile Settings Form**: 
  - Name input
  - Email input
  - Phone input
  - Save Changes button
- **Security Settings**: 
  - Password input
  - MFA input
  - Update Security button
- **Notification Preferences**: 
  - Email Notifications toggle
  - SMS Notifications toggle
  - Save Preferences button
- **Subscription Management**: 
  - Current Plan display
  - Upgrade Plan button
  - Manage Subscription button

#### State Management
\`\`\`typescript
interface SettingsState {
  profileData: any
  securityData: any
  notificationPrefs: any
  subscriptionData: any
  loading: boolean
  error: string | null
  formValid: boolean
}
\`\`\`

#### API Interactions
- **GET `/api/user/settings`**: Fetch user settings data
- **PUT `/api/user/settings`**: Update user settings
- **PUT `/api/user/security`**: Update security settings

## Admin Dashboard (`/admin`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  AdminLayout: Logo | Navigation Sidebar | Main Content    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Management Table                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Username │ Email          │ Role    │ Status      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ user1    │ user1@example.com│ Admin   │ Active      │   │
│  │ user2    │ user2@example.com│ User    │ Suspended   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Subscription Management Interface                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Company  │ Plan    │ Status      │ Actions       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Acme Corp│ Basic   │ Active      │ [Ban] [Modify]│   │
│  │ XYZ Ltd  │ Premium │ Suspended   │ [Ban] [Modify]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Notification System Controls                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Send Notification                                      │   │
│  │ [  Send  ]                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Security Monitoring Dashboard                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Logs                                                   │   │
│  │ [  View Logs  ]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Component Specifications
- **AdminLayout**: 
  - Logo
  - Navigation sidebar
  - Main content area
- **User Management Table**: 
  - Displays list of users
  - Columns: Username, Email, Role, Status
  - Actions: Ban user, Modify subscription
- **Subscription Management Interface**: 
  - Displays list of subscriptions
  - Columns: Company, Plan, Status, Actions
  - Actions: Ban user, Modify subscription
- **Notification System Controls**: 
  - Send notification form
  - Send button
- **Security Monitoring Dashboard**: 
  - Displays security logs
  - View Logs button

#### State Management
\`\`\`typescript
interface AdminState {
  users: any[]
  subscriptions: any[]
  notificationLogs: any[]
  loading: boolean
  error: string | null
  filter: string
  pagination: any
}
\`\`\`

#### API Interactions
- **GET `/api/admin/users`**: Fetch list of users
- **GET `/api/admin/subscriptions`**: Fetch list of subscriptions
- **PUT/DELETE various admin endpoints**: Manage user and subscription data
- **GET `/api/admin/security/logs`**: Fetch security logs

## Developer Screen (`/dev`)

#### Layout Structure
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  DeveloperLayout: Logo | Navigation Sidebar | Main Content│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sample Data Controls                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Generate Sample Data                                 │   │
│  │ [  Generate  ]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  System Status Monitors                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ System Health: [Good]                               │   │
│  │ AI Processing: [Active]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Debug Information                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Debug Mode: [On]                                     │   │
│  │ [  Toggle Debug Mode  ]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Component Specifications
- **SampleDataControls**: 
  - Generate Sample Data button
- **System Status Monitors**: 
  - System Health display
  - AI Processing status display
- **Debug Information**: 
  - Debug Mode toggle
  - Display debug logs and information

#### State Management
\`\`\`typescript
interface DeveloperState {
  debugMode: boolean
  sampleDataConfig: any
  systemStatus: any
  loading: boolean
  error: string | null
}
\`\`\`

#### API Interactions
- **Various debug endpoints**: Access and manage debug information

This comprehensive screen specification provides detailed layouts, component structures, and responsive design patterns for all major screens in the S(ai)m Jr application.
