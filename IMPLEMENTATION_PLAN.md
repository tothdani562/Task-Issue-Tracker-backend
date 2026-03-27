# IMPLEMENTATION_PLAN

## Cél
Task / Issue Tracker backend megvalósítása `NestJS + Prisma` stackkel, tiszta architektúrával, erős validációval, és iterációnként ellenőrzött helyes működéssel.

## Scope
- User regisztráció / login
- Project létrehozás és kezelés
- Task CRUD
- Task mezők: `status` (`todo`, `in-progress`, `done`), `priority`, `assignedUser`, `dueDate`
- Szűrés: status, priority, assignee
- Pagination
- Comment modell és endpointok

## Nem része ennek a tervnek
- Websocket real-time update
- Fájl csatolmányok
- Dashboard/reporting

## Iterációs terv

### Iteráció 0: Alapozás (architektúra + minőség)
- NestJS projekt inicializálás, Prisma init, env kezelés
- Modulstruktúra: `auth`, `users`, `projects`, `tasks`, `comments`, `common`
- Globális `ValidationPipe` (`transform`, `whitelist`, `forbidNonWhitelisted`)
- Lint + strict TS + egységes hibakezelési konvenció
- CI alap pipeline: lint, typecheck, unit test

Elfogadási feltétel:
- Projekt indul, pipe-ok aktívak, minőségkapuk futnak.

### Iteráció 1: Auth
- Docker PostgreSQL adatbázis létrehozása
- Prisma beállítása a Docker adatbázishoz
- Prisma `User` modell (`email` unique, `passwordHash`, timestamp-ek)
- `POST /auth/register`, `POST /auth/login`
- Password hashing + JWT access token
- Guard + `@CurrentUser()`
- DTO és validáció auth endpointokra

Elfogadási feltétel:
- Felhasználó regisztrál/bejelentkezik, védett endpoint guardolt.

### Iteráció 2: Projects + jogosultság
- `Project` modell és CRUD endpointok
- Ownership/membership access check
- Service szintű jogosultság helper-ek
- Integration tesztek hozzáférésre

Elfogadási feltétel:
- Idegen felhasználó nem módosíthat más projektjét.

### Iteráció 3: Tasks CRUD + alap filter + pagination
- `Task` modell: cím, leírás, státusz, priority, assignee, dueDate, project kapcsolat
- Task CRUD endpointok
- Query paramok: `status`, `priority`, `assigneeId`, `page`, `limit`
- Pagination meta: `total`, `page`, `limit`, `hasNext`

Elfogadási feltétel:
- Task lista szűrhető és lapozható, CRUD végig működik.

### Iteráció 4: Haladó query + indexelés
- Prisma indexek task filterekre
- Opcionális plusz queryk: `dueFrom`, `dueTo`, rendezés
- Dinamikus, tesztelt `where` builder
- Limit cap és invalid query kezelés

Elfogadási feltétel:
- Kombinált szűrések megbízhatóan működnek és teljesítmény rendben van.

### Iteráció 5: Comments
- `Comment` modell + task-hoz kötött CRUD
- Author/project membership jogosultságok
- DTO validáció (content szabályok)

Elfogadási feltétel:
- Csak jogosult user kommentelhet/kezelhet kommentet.

### Iteráció 6: Auth hardening
- Refresh token flow
- Rate limiting auth endpointokra
- Security/CORS finomhangolás

Elfogadási feltétel:
- Token frissítés és auth védelem stabil.

### Iteráció 7: E2E + release readiness
- E2E fő user-flowk
- Regressziós edge case-ek
- Swagger/OpenAPI dokumentáció
- Release checklist (migráció, seed, env, health)

Elfogadási feltétel:
- Rendszer dokumentált, tesztelt, kiadható.

## Adatmodell (Prisma)
- `users`
- `projects`
- `tasks`
- `comments`

Tervezett relációk:
- User 1-N Projects (owner)
- Project 1-N Tasks
- User 1-N Tasks (assignee)
- Task 1-N Comments
- User 1-N Comments (author)

## Minőség és helyes működés garanciája
- DTO alapú request-validáció minden write endpointon
- Egységes exception mapping és response shape
- Unit + integration + e2e tesztek iterációnként
- Migration + seed sanity check minden schema módosításnál
- CI gate: lint + typecheck + teszt kötelező

## Ajánlott könyvtárstruktúra
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/main.ts`
- `src/app.module.ts`
- `src/auth/*`
- `src/users/*`
- `src/projects/*`
- `src/tasks/*`
- `src/comments/*`
- `src/common/*`
- `test/*`

## Verification checklist
1. Auth: register/login hibátlan és guardolt route-ok működnek.
2. Projects: jogosultságok sérthetetlenek (owner/member szabályok).
3. Tasks: CRUD + filter + pagination kombinációk lefedve.
4. Comments: csak jogosult user fér hozzá.
5. CI teljesen zöld minden iteráció végén.
