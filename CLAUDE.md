# Frontend — Guide for Claude

## Purpose

React SPA (Single Page Application) that provides the complete user interface: AI chat, API management, import setup wizard, administration panel, and diagnostics.

---

## Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 19.1.0 |
| Language | TypeScript (strict) |
| Build tool | Vite 5.0.0 |
| Styling | Tailwind CSS 4.1.11 (via @tailwindcss/vite plugin) |
| Routing | React Router DOM 7.8.2 (nested routes) |
| HTTP client | Axios 1.12.0 (with JWT and refresh interceptors) |
| Streaming | @microsoft/fetch-event-source (SSE for chat) |
| Charts | Chart.js 4.5.0 + react-chartjs-2 5.3.0 |
| Markdown | react-markdown 10.1.0 + remark-gfm |
| Icons | Lucide React 0.525.0 |
| Dates | date-fns 4.1.0 |
| Auth tokens | jwt-decode 4.0.0 |
| Prod server | Nginx (Docker container) |
| CI/CD | GitHub Actions → Docker Hub (`alesquiintelligence/frontend`) |

---

## Directory Structure

```
src/
├── api/
│   └── axiosConfig.ts          # Centralized Axios instance with interceptors
├── components/
│   ├── Admin/                  # Administration panel
│   │   ├── AdminLayout.tsx
│   │   ├── Audit/              # AuditLogList, AuditLogDetail
│   │   ├── Groups/             # GroupList, GroupDetail, CreateGroupModal
│   │   └── Users/              # UserList, UserDetail, CreateUserModal
│   ├── ApiDetails/             # API management
│   │   ├── ApiList.tsx
│   │   ├── ApiDetailsTab.tsx
│   │   ├── EndpointList.tsx
│   │   ├── ManageApiPage.tsx
│   │   └── SchemaViewer.tsx
│   ├── Chat/                   # Chat interface
│   │   ├── ChatTab.tsx         # Main container
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatMessageChart.tsx
│   │   ├── ConversationHistory.tsx
│   │   ├── InteractiveReasoning.tsx
│   │   └── AssistantCapabilities.tsx
│   ├── Common/                 # Reusable UI components
│   │   ├── Tabs.tsx
│   │   └── ToggleChevron.tsx
│   ├── Diagnostics/
│   │   ├── DiagnosticsTab.tsx
│   │   └── DiagnosticDetailModal.tsx
│   ├── Layout/
│   │   ├── AppLayout.tsx       # Main authenticated layout
│   │   ├── Header.tsx          # Navigation with role-based filtering
│   │   └── Notifications.tsx   # Toast notifications
│   ├── Security/
│   │   └── ProtectedRoute.tsx  # Auth + role guard
│   └── Setup/                  # API configuration wizard (4 steps)
│       ├── SetupTab.tsx
│       ├── StepProgress.tsx
│       ├── SwaggerStep.tsx
│       ├── PostmanStep.tsx
│       ├── UnifyStep.tsx
│       └── ConfigurationStep.tsx
├── context/
│   ├── AuthContext.tsx          # JWT, user data, login/logout
│   ├── DeploymentContext.tsx    # TRIAL/CORPORATE mode
│   └── NotificationContext.tsx  # Global toasts
├── hooks/
│   ├── useChat.ts              # Chat state (messages, history, streaming)
│   └── useApiForm.ts           # API configuration wizard state
├── pages/
│   ├── LoginPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── ActivateAccountPage.tsx
│   └── UnauthorizedPage.tsx
├── services/
│   ├── apiService.ts           # CRUD for configured APIs
│   ├── chatService.ts          # Chat with SSE streaming
│   ├── adminService.ts         # User/group/audit management
│   ├── swaggerService.ts       # Swagger upload and parsing
│   ├── postmanService.ts       # Postman upload and parsing
│   ├── apiUnificationService.ts
│   ├── diagnosticsService.ts
│   ├── deploymentService.ts
│   └── activationService.ts
├── types/
│   └── types.ts                # Centralized TypeScript interfaces
├── utils/
│   └── dateUtils.ts
├── App.tsx                     # Router with routes and roles
├── main.jsx                    # Entry point (providers wrapping)
└── index.css                   # Tailwind imports + custom scrollbar
```

---

## Authentication Flow

```
LoginPage → POST /api/auth/login
  → AuthContext.login(accessToken, refreshToken)
  → localStorage.setItem('accessToken', ...)
  → jwt-decode extracts { sub, authorities }
  → Redirect to /chat

Axios interceptor (request):
  → Attaches Authorization: Bearer <token>

Axios interceptor (response 401):
  → Attempts token refresh
  → If OK: retries original request
  → If fails: logout() → /login
```

---

## Role and Route System

```
/login, /forgot-password, /reset-password, /activate-account  → Public

/chat                          → Authenticated (any role)
/setup, /apis, /diagnostics    → ROLE_IT | ROLE_SUPERADMIN | ROLE_TRIAL
/admin/users, /admin/groups,   → ROLE_SUPERADMIN
/admin/audit
```

`ProtectedRoute` checks `isAuthenticated` + allowed roles.
Navigation in `Header.tsx` filters items based on `user.authorities`.

---

## Global State (Context API)

| Context | State it manages |
|---------|-----------------|
| `AuthContext` | JWT token, user data, isAuthenticated, login(), logout() |
| `NotificationContext` | toast list; `addNotification(msg, type)`; auto-dismiss 5s |
| `DeploymentContext` | deploymentInfo, isTrialMode, isCorporateMode |

Provider order in `main.jsx`:
```tsx
<DeploymentProvider>
  <AuthProvider>
    <NotificationProvider>
      <AlesquiIntelligenceApp />
    </NotificationProvider>
  </AuthProvider>
</DeploymentProvider>
```

---

## Chat and SSE Streaming

```typescript
// chatService.ts — streamMessage()
fetchEventSource('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify(chatRequest),
  onmessage(event) {
    // event.type: 'STATUS' | 'FINAL_RESPONSE' | 'ERROR'
    // Updates state in useChat hook
  }
})
```

SSE event types:
- `STATUS`: intermediate agent steps (reasoning)
- `FINAL_RESPONSE`: final response with content, chart data, reasoning steps
- `ERROR`: processing error

---

## Key TypeScript Interfaces (`types.ts`)

```typescript
// Deployment modes
type DeploymentMode = 'TRIAL' | 'CORPORATE'

// Roles
type UserRole = 'ROLE_SUPERADMIN' | 'ROLE_IT' | 'ROLE_TRIAL' | 'ROLE_BUSINESS'

// Chat
interface ChatMessageForRender {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  reasoning?: ReasoningStep[]
  chart?: ChartData
}

// ReAct reasoning
interface ReasoningStep {
  id: string
  type: 'THOUGHT' | 'TOOL_CALL' | 'FINAL_RESPONSE'
  textContent: string
  toolCalls?: ToolCall[]
}

// API configuration
interface ApiConfig {
  baseUrl: string
  timeoutSeconds: number
  maxRetries: number
  enableLogging: boolean
  rateLimit?: number
  readOnly: boolean
  auth: AuthConfig  // discriminated union: none | api_key | bearer | basic | oauth2
}
```

---

## Environment Variables

| Variable | When | Description |
|----------|------|-------------|
| `VITE_API_BASE_URL` | Build-time / Docker Runtime | Backend URL. If not defined in dev, uses Vite proxy → `http://localhost:8080`. In Docker, injected at runtime via `docker-entrypoint.sh` (sed on compiled JS). |

```bash
# Local development (no variable → uses proxy)
npm run dev

# Production with explicit URL
VITE_API_BASE_URL=https://api.example.com npm run build
```

---

## Docker and Nginx

**Dockerfile** (multi-stage):
1. `node:20-alpine` → `npm install --legacy-peer-deps` → `npm run build`
2. `nginx:alpine` → copies `dist/` → exposes port 80

**nginx.conf** configures:
- SPA routing: unknown routes → `/index.html`
- Proxy `/api/` → `http://backend:8080` (Docker DNS name)
- Gzip compression
- 1-year cache for static assets (`.js`, `.css`, images)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- Health check: `GET /health` → 200 OK

---

## Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps   # legacy-peer-deps required for React 19

# Development with hot reload
npm run dev                       # Vite dev server on :5173, proxy /api → :8080

# Production build
npm run build                     # Output in dist/

# Preview build
npm run preview

# Lint
npm run lint

# Docker build
docker build -t alesqui-intelligence-frontend .

# Run container
docker run -p 80:80 -e VITE_API_BASE_URL=http://backend:8080 alesqui-intelligence-frontend
```

---

## Conventions

- **Strict TypeScript**: No `any`. All interfaces go in `types/types.ts`.
- **Services as singletons**: Each service exports an instance `export default new XxxService()`.
- **Custom hooks for complex state**: Chat logic in `useChat.ts`, wizard in `useApiForm.ts`.
- **No Redux**: Global state via Context API only.
- **Notifications**: Always use `addNotification()` from context, never `alert()`.
- **Pure Tailwind**: No CSS modules or styled-components. Tailwind classes directly in JSX.
- **Lucide for icons**: Do not mix other icon libraries.
- **`--legacy-peer-deps`**: Required in npm install due to peer dep conflicts with React 19.

---

## CI/CD

- **Trigger**: push to `master` or tags `v*.*.*`
- **Pipeline**: GitHub Actions → multi-platform Docker build → push `alesquiintelligence/frontend:latest`
- **Runtime config injection**: `docker-entrypoint.sh` replaces placeholder in compiled JS with the actual `VITE_API_BASE_URL`
