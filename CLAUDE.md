# Frontend — Guía para Claude

## Propósito

SPA (Single Page Application) React que proporciona la interfaz de usuario completa: chat con IA, gestión de APIs, setup wizard de importación, panel de administración y diagnósticos.

---

## Stack

| Componente | Tecnología |
|-----------|-----------|
| Framework | React 19.1.0 |
| Lenguaje | TypeScript (strict) |
| Build tool | Vite 5.0.0 |
| Styling | Tailwind CSS 4.1.11 (via @tailwindcss/vite plugin) |
| Routing | React Router DOM 7.8.2 (nested routes) |
| HTTP client | Axios 1.12.0 (con interceptores JWT y refresh) |
| Streaming | @microsoft/fetch-event-source (SSE para chat) |
| Charts | Chart.js 4.5.0 + react-chartjs-2 5.3.0 |
| Markdown | react-markdown 10.1.0 + remark-gfm |
| Iconos | Lucide React 0.525.0 |
| Fecha | date-fns 4.1.0 |
| Auth tokens | jwt-decode 4.0.0 |
| Servidor prod | Nginx (container Docker) |
| CI/CD | GitHub Actions → Docker Hub (`alesquiintelligence/frontend`) |

---

## Estructura de Directorios

```
src/
├── api/
│   └── axiosConfig.ts          # Instancia Axios centralizada con interceptores
├── components/
│   ├── Admin/                  # Panel administración
│   │   ├── AdminLayout.tsx
│   │   ├── Audit/              # AuditLogList, AuditLogDetail
│   │   ├── Groups/             # GroupList, GroupDetail, CreateGroupModal
│   │   └── Users/              # UserList, UserDetail, CreateUserModal
│   ├── ApiDetails/             # Gestión de APIs
│   │   ├── ApiList.tsx
│   │   ├── ApiDetailsTab.tsx
│   │   ├── EndpointList.tsx
│   │   ├── ManageApiPage.tsx
│   │   └── SchemaViewer.tsx
│   ├── Chat/                   # Interfaz de chat
│   │   ├── ChatTab.tsx         # Contenedor principal
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatMessageChart.tsx
│   │   ├── ConversationHistory.tsx
│   │   ├── InteractiveReasoning.tsx
│   │   └── AssistantCapabilities.tsx
│   ├── Common/                 # Componentes UI reutilizables
│   │   ├── Tabs.tsx
│   │   └── ToggleChevron.tsx
│   ├── Diagnostics/
│   │   ├── DiagnosticsTab.tsx
│   │   └── DiagnosticDetailModal.tsx
│   ├── Layout/
│   │   ├── AppLayout.tsx       # Layout autenticado principal
│   │   ├── Header.tsx          # Navegación con filtrado por roles
│   │   └── Notifications.tsx   # Toast notifications
│   ├── Security/
│   │   └── ProtectedRoute.tsx  # Guard con auth + roles
│   └── Setup/                  # Wizard de configuración de APIs (4 pasos)
│       ├── SetupTab.tsx
│       ├── StepProgress.tsx
│       ├── SwaggerStep.tsx
│       ├── PostmanStep.tsx
│       ├── UnifyStep.tsx
│       └── ConfigurationStep.tsx
├── context/
│   ├── AuthContext.tsx          # JWT, usuario, login/logout
│   ├── DeploymentContext.tsx    # Modo TRIAL/CORPORATE
│   └── NotificationContext.tsx  # Toasts globales
├── hooks/
│   ├── useChat.ts              # Estado del chat (mensajes, historial, streaming)
│   └── useApiForm.ts           # Estado del wizard de configuración de APIs
├── pages/
│   ├── LoginPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── ActivateAccountPage.tsx
│   └── UnauthorizedPage.tsx
├── services/
│   ├── apiService.ts           # CRUD de APIs configuradas
│   ├── chatService.ts          # Chat con SSE streaming
│   ├── adminService.ts         # Gestión usuarios/grupos/audit
│   ├── swaggerService.ts       # Upload y parsing Swagger
│   ├── postmanService.ts       # Upload y parsing Postman
│   ├── apiUnificationService.ts
│   ├── diagnosticsService.ts
│   ├── deploymentService.ts
│   └── activationService.ts
├── types/
│   └── types.ts                # Interfaces TypeScript centralizadas
├── utils/
│   └── dateUtils.ts
├── App.tsx                     # Router con rutas y roles
├── main.jsx                    # Entry point (providers wrapping)
└── index.css                   # Tailwind imports + custom scrollbar
```

---

## Flujo de Autenticación

```
LoginPage → POST /api/auth/login
  → AuthContext.login(accessToken, refreshToken)
  → localStorage.setItem('accessToken', ...)
  → jwt-decode extrae { sub, authorities }
  → Redirección a /chat

Axios interceptor (request):
  → Adjunta Authorization: Bearer <token>

Axios interceptor (response 401):
  → Intenta refresh token
  → Si OK: reintenta petición original
  → Si falla: logout() → /login
```

---

## Sistema de Roles y Rutas

```
/login, /forgot-password, /reset-password, /activate-account  → Públicas

/chat                          → Autenticado (cualquier rol)
/setup, /apis, /diagnostics    → ROLE_IT | ROLE_SUPERADMIN | ROLE_TRIAL
/admin/users, /admin/groups,   → ROLE_SUPERADMIN
/admin/audit
```

El componente `ProtectedRoute` comprueba `isAuthenticated` + roles permitidos.
La navegación en `Header.tsx` filtra los ítems según `user.authorities`.

---

## Estado Global (Context API)

| Context | Estado que maneja |
|---------|------------------|
| `AuthContext` | token JWT, datos usuario, isAuthenticated, login(), logout() |
| `NotificationContext` | lista de toasts; `addNotification(msg, type)`; auto-dismiss 5s |
| `DeploymentContext` | deploymentInfo, isTrialMode, isCorporateMode |

El orden de providers en `main.jsx`:
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

## Chat y Streaming SSE

```typescript
// chatService.ts — streamMessage()
fetchEventSource('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify(chatRequest),
  onmessage(event) {
    // event.type: 'STATUS' | 'FINAL_RESPONSE' | 'ERROR'
    // Actualiza estado en useChat hook
  }
})
```

Tipos de eventos SSE:
- `STATUS`: pasos intermedios del agente (reasoning)
- `FINAL_RESPONSE`: respuesta final con contenido, chart data, reasoning steps
- `ERROR`: error en el procesamiento

---

## Interfaces TypeScript Clave (`types.ts`)

```typescript
// Modos de despliegue
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

// Configuración de API
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

## Variables de Entorno

| Variable | Cuándo | Descripción |
|----------|--------|-------------|
| `VITE_API_BASE_URL` | Build-time / Runtime Docker | URL del backend. Si no está definida en dev, usa proxy Vite → `http://localhost:8080`. En Docker se inyecta en runtime via `docker-entrypoint.sh` (sed sobre JS compilado). |

```bash
# Desarrollo local (sin variable → usa proxy)
npm run dev

# Producción con URL explícita
VITE_API_BASE_URL=https://api.ejemplo.com npm run build
```

---

## Docker y Nginx

**Dockerfile** (multi-stage):
1. `node:20-alpine` → `npm install --legacy-peer-deps` → `npm run build`
2. `nginx:alpine` → copia `dist/` → expone puerto 80

**nginx.conf** configura:
- SPA routing: rutas desconocidas → `/index.html`
- Proxy `/api/` → `http://backend:8080` (nombre DNS Docker)
- Gzip compresión
- Cache 1 año para assets estáticos (`.js`, `.css`, imágenes)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- Health check: `GET /health` → 200 OK

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install --legacy-peer-deps   # legacy-peer-deps necesario por React 19

# Desarrollo con hot reload
npm run dev                       # Vite dev server en :5173, proxy /api → :8080

# Build producción
npm run build                     # Output en dist/

# Preview del build
npm run preview

# Lint
npm run lint

# Build Docker
docker build -t alesqui-intelligence-frontend .

# Ejecutar container
docker run -p 80:80 -e VITE_API_BASE_URL=http://backend:8080 alesqui-intelligence-frontend
```

---

## Convenciones

- **TypeScript estricto**: No usar `any`. Todas las interfaces van en `types/types.ts`.
- **Servicios como singleton**: Cada servicio exporta una instancia `export default new XxxService()`.
- **Custom hooks para estado complejo**: Lógica del chat en `useChat.ts`, wizard en `useApiForm.ts`.
- **No Redux**: Estado global via Context API únicamente.
- **Notificaciones**: Siempre usar `addNotification()` del contexto, nunca `alert()`.
- **Tailwind puro**: Sin CSS modules ni styled-components. Clases Tailwind directamente en JSX.
- **Lucide para iconos**: No mezclar otras librerías de iconos.
- **`--legacy-peer-deps`**: Necesario en npm install por conflictos de peer deps con React 19.

---

## CI/CD

- **Trigger**: push a `master` o tags `v*.*.*`
- **Pipeline**: GitHub Actions → build Docker multi-platform → push `alesquiintelligence/frontend:latest`
- **Runtime config injection**: `docker-entrypoint.sh` reemplaza placeholder en JS compilado con `VITE_API_BASE_URL` real
