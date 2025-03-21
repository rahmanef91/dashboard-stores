# Enterprise Widget Integration Platform

## Project Overview
The Enterprise Widget Integration Platform is a comprehensive dashboard for managing and integrating enterprise widgets with an intuitive interface for widget configuration, deployment, and monitoring.

## Key Features
- Clean, dark-themed UI with sidebar navigation and card-based widget display areas
- Widget management system with drag-and-drop functionality and configuration panels
- Built-in developer tools with local storage persistence for widget settings and dashboard layouts
- Performance monitoring section with widget health indicators and loading metrics
- Responsive design with mobile-friendly navigation and widget containers

## Architecture
The project follows a vertical slice architecture, organizing code by feature rather than technical concerns. Each widget is self-contained with its own UI components, business logic, and data access.

### Technology Stack
- **Frontend**: Next.js with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React hooks and Context API
- **Data Storage**: Browser local storage
- **Drag and Drop**: react-dnd

## Development Guidelines
- Follow the widget development guide in `docs/WIDGET_DEVELOPMENT.md`
- Use Tailwind CSS for styling to maintain consistency
- Implement responsive design for all components
- Store all user preferences and widget configurations in local storage
- Follow the established component patterns in the codebase

## Project Structure
- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable UI components
- `/src/widgets` - Widget implementations and registry
- `/src/lib` - Utility functions and shared code
- `/docs` - Documentation for developers

## Getting Started
1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Access the dashboard at `http://localhost:3000/dashboard`

## Contributing
To contribute a new widget, follow the widget development guide and submit a pull request with your implementation.

## Roadmap
See the `PLAN.md` file for the current development plan and roadmap.
