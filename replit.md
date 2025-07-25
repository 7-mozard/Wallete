# Wallete - Electronic Wallet Application

## Overview
Wallete is a comprehensive electronic wallet web application that enables users to transfer money between accounts, purchase items from an integrated shop, and receive electronic currency after real-world deposits to administrators. The application features a dual-role system with administrators managing the platform and clients using wallet services.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

The frontend follows a component-based architecture with separate pages for different user roles (admin/client) and shared components for common functionality.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and API endpoints
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: JWT-based authentication with middleware protection

The backend implements a RESTful API architecture with role-based access control and secure authentication mechanisms.

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- Role-based access control (admin vs client)
- Password hashing using bcrypt
- Protected routes with middleware authentication
- Session management with automatic token validation

### Database Schema
- **Users**: Store user accounts with role-based access (admin/client)
- **Wallets**: Electronic wallet balances in multiple currencies (FC/USD)
- **Products**: Shop inventory with stock management
- **Transactions**: Complete transaction history with type tracking
- **Notifications**: Real-time user notifications system

### User Roles
1. **Administrator**:
   - Create electronic money in the system
   - Credit user accounts after real-world deposits
   - Manage user accounts (view, block, delete)
   - Manage shop products and inventory
   - View comprehensive transaction analytics

2. **Client**:
   - Create account and authenticate
   - Maintain electronic wallet with multi-currency support
   - Transfer money to other clients
   - Purchase products from integrated shop
   - Receive notifications for all transactions
   - View personal transaction history

### Shop System
- Product catalog with inventory management
- Real-time stock tracking
- Purchase validation against wallet balance
- Automatic wallet deduction and inventory updates

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Server validates credentials and generates JWT token
3. Token stored in localStorage for subsequent requests
4. Protected routes validate token and user permissions
5. Automatic logout on token expiration or invalid sessions

### Transaction Flow
1. User initiates transaction (transfer/purchase)
2. System validates user permissions and wallet balance
3. Transaction recorded in database with complete audit trail
4. Wallet balances updated atomically
5. Notification generated for affected users
6. Real-time UI updates via React Query invalidation

### Money Creation Flow (Admin)
1. Administrator creates electronic currency
2. System injects money into the platform
3. Transaction recorded as money creation type
4. Available for crediting to user accounts

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management
- **@radix-ui/***: UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the application
- **drizzle-kit**: Database migration management
- **esbuild**: Production JavaScript bundling

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized React bundle
- Backend: esbuild bundles Node.js server with external dependencies
- Database: Drizzle migrations ensure schema consistency

### Environment Configuration
- DATABASE_URL: PostgreSQL connection string (required)
- JWT_SECRET: Secure token signing key
- NODE_ENV: Environment-specific configurations

### Production Setup
- Compatible with Render, Railway, or similar Node.js platforms
- PostgreSQL database provisioning required
- Environment variables must be configured
- Single deployment contains both frontend and backend

### Database Management
- Drizzle migrations in `/migrations` directory
- Schema defined in `/shared/schema.ts`
- Push migrations with `npm run db:push`
- PostgreSQL dialect with UUID primary keys

The application is designed as a full-stack monolith with the frontend served as static files by the Express server in production, simplifying deployment while maintaining development flexibility.