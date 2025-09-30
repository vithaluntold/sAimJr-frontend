# S(ai)m Jr - AI Accounting Assistant

S(ai)m Jr is an intelligent accounting assistant built with Next.js 14 and FastAPI, featuring real-time AI-powered transaction categorization and processing workflows.

## Features

- **AI-Powered Chat Interface**: Conversational workflow for processing accounting data
- **Real-time Validation**: WebSocket-based live input validation and correction suggestions
- **Multi-step Workflow**: 8-step guided process from company setup to report generation
- **Transaction Processing**: Automated bank statement parsing and categorization
- **Exception Handling**: Smart detection and resolution of ambiguous transactions
- **Chart of Accounts Generation**: AI-generated COA based on company profile
- **Rule Management**: Create and manage custom transaction categorization rules

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **WebSocket** for real-time validation

### Backend
- **FastAPI** for high-performance API
- **Python 3.11+**
- **Azure OpenAI** for AI processing
- **WebSocket** for real-time communication
- **Pydantic** for data validation

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Azure OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saim-jr-ui
```

2. Install frontend dependencies:
```bash
pnpm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Backend: Create backend/.env
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python main.py
```

2. Start the frontend development server:
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── [business]        # Business-specific components
├── backend/              # FastAPI backend
│   ├── main.py          # Main server file
│   ├── ai_service.py    # AI integration
│   └── websocket_manager.py # WebSocket handling
├── lib/                  # Utility libraries
├── docs/                 # Documentation
└── public/              # Static assets
```

## Key Components

- **ChatPanel**: Main conversation interface with step-based workflow
- **OutputPanel**: Displays results (COA, transactions, exceptions)
- **WorkflowSidebar**: Shows 8-step progress tracking
- **LiveValidationInput**: Real-time AI validation for user inputs

## Deployment

This application is designed to be deployed on Render with:
- Frontend as a Next.js service
- Backend as a Python web service
- Environment variables configured in Render dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.