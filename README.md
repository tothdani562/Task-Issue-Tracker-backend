# Task Manager API (NestJS + Prisma)

Backend API egy task/issue tracker rendszerhez.

Fobb modulok:
- Auth (register/login/refresh/logout/me)
- Projects (CRUD + tagsagkezeles)
- Tasks (CRUD + szures + lapozas)
- Comments (task kommentek CRUD)

## Technologia
- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- JWT auth
- Docker Compose (lokalis adatbazishoz)

## Teljes Setup (lepesrol lepesre)

## 1. Elofeltetelek
- Node.js 22+ (ajanlott LTS)
- npm 10+
- Docker Desktop + Docker Compose

## 2. Projekt klonozasa
```bash
git clone <repo-url>
cd Nest-Prisma
```

## 3. Fuggosegek telepitese
```bash
npm install
```

## 4. Kornyezeti valtozok beallitasa
Hozz letre egy `.env` fajlt a `.env.example` alapjan.

Kotelezo valtozok:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `CORS_ORIGIN`

Minimalis pelda:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest_prisma_task_manager?schema=public"
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="replace-with-strong-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

## 5. PostgreSQL inditasa Dockerrel
```bash
docker compose up -d
```

Ellenorzes:
```bash
docker compose ps
```

## 6. Prisma generalas es migracio
```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name init_auth
```

## 7. Alkalmazas inditasa
Fejlesztoi mod:
```bash
npm run start:dev
```

Production build + futtatas:
```bash
npm run build
npm run start:prod
```

## 8. Dokumentacio ellenorzese
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

## 9. Minosegi ellenorzesek
```bash
npm run lint:check
npm run typecheck
npm run test
npm run test:e2e
```

Release elott futtasd a checklistet is:
- `RELEASE_CHECKLIST.md`

## Auth hasznalat roviden
1. `POST /auth/register` vagy `POST /auth/login`
2. `accessToken` megy `Authorization: Bearer <token>` headerben
3. Lejart access token eseten `POST /auth/refresh`
4. Kijelentkezes: `POST /auth/logout`

## API Dokumentacio

## Base URL
- `http://localhost:3000`

## Hitelesites
- A vedett endpointok `Authorization: Bearer <accessToken>` headert varnak.

## Endpoint lista (minden vegpont)

| Method | Endpoint | Auth | Leiras |
|---|---|---|---|
| GET | `/` | No | Egyszeru health-check jellegu valasz (`Hello World!`) |
| POST | `/auth/register` | No | Uj user regisztracio |
| POST | `/auth/login` | No | Bejelentkezes |
| POST | `/auth/refresh` | No | Token frissites refresh tokennel |
| POST | `/auth/logout` | Yes | Kijelentkezes + refresh token hash torles |
| GET | `/auth/me` | Yes | Aktualis bejelentkezett user payload |
| POST | `/projects` | Yes | Projekt letrehozas |
| GET | `/projects` | Yes | Projektek listazasa (owner/member) |
| GET | `/projects/:id` | Yes | Egy projekt lekerdezese |
| PATCH | `/projects/:id` | Yes | Projekt modositasa (owner) |
| DELETE | `/projects/:id` | Yes | Projekt torlese (owner) |
| POST | `/projects/:id/members` | Yes | Tag hozzaadasa projekthez (owner) |
| DELETE | `/projects/:id/members/:memberUserId` | Yes | Tag eltavolitasa projektbol (owner) |
| POST | `/projects/:projectId/tasks` | Yes | Task letrehozas projektben |
| GET | `/projects/:projectId/tasks` | Yes | Task lista szuressel/lapozassal |
| GET | `/projects/:projectId/tasks/:taskId` | Yes | Egy task lekerdezese |
| PATCH | `/projects/:projectId/tasks/:taskId` | Yes | Task modositasa |
| DELETE | `/projects/:projectId/tasks/:taskId` | Yes | Task torlese |
| POST | `/tasks/:taskId/comments` | Yes | Komment letrehozas taskhoz |
| GET | `/tasks/:taskId/comments` | Yes | Komment lista taskhoz (lapozhato) |
| GET | `/tasks/:taskId/comments/:commentId` | Yes | Egy komment lekerdezese |
| PATCH | `/tasks/:taskId/comments/:commentId` | Yes | Komment modositasa (author vagy project owner) |
| DELETE | `/tasks/:taskId/comments/:commentId` | Yes | Komment torlese (author vagy project owner) |

## Request body referencia

### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### POST /auth/refresh
```json
{
  "refreshToken": "<refresh_token>"
}
```

### POST /projects
```json
{
  "name": "My Project",
  "description": "Optional project description"
}
```

### PATCH /projects/:id
```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

### POST /projects/:id/members
```json
{
  "userId": "<user-uuid>"
}
```

### POST /projects/:projectId/tasks
```json
{
  "title": "Implement endpoint",
  "description": "Optional",
  "status": "TODO",
  "priority": "HIGH",
  "assignedUserId": "<user-uuid>",
  "dueDate": "2031-01-01T00:00:00.000Z"
}
```

### PATCH /projects/:projectId/tasks/:taskId
```json
{
  "title": "Updated task",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

### GET /projects/:projectId/tasks query paramok
- `status`: `TODO` | `IN_PROGRESS` | `DONE`
- `priority`: `LOW` | `MEDIUM` | `HIGH`
- `assigneeId`: UUID
- `dueFrom`: ISO date string
- `dueTo`: ISO date string
- `sortBy`: `createdAt` | `dueDate` | `priority` | `status`
- `sortOrder`: `asc` | `desc`
- `page`: integer (min: 1)
- `limit`: integer (1-100)

### POST /tasks/:taskId/comments
```json
{
  "content": "This task needs clarification"
}
```

### PATCH /tasks/:taskId/comments/:commentId
```json
{
  "content": "Updated comment text"
}
```

### GET /tasks/:taskId/comments query paramok
- `page`: integer (min: 1)
- `limit`: integer (1-100)

## Response forma

Tobb endpoint ezt hasznalja:
```json
{
  "success": true,
  "data": {}
}
```

Hibak globalisan:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "...",
  "path": "/requested/path",
  "timestamp": "2026-03-28T12:00:00.000Z"
}
```

## Hasznos script parancsok
- `npm run start:dev` - fejlesztoi futtas
- `npm run build` - build
- `npm run start:prod` - production futtas
- `npm run lint:check` - lint ellenorzes
- `npm run typecheck` - TS typecheck
- `npm run test` - unit test
- `npm run test:e2e` - e2e test
- `npm run prisma:generate` - prisma client generalas
- `npm run prisma:migrate:dev` - lokalis migracio
- `npm run prisma:studio` - Prisma Studio
