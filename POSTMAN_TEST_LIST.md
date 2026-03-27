# Postman Test List - Iteration 1-2

## Prerequisites
1. Start database: `docker compose up -d`
2. Run migrations: `npm run prisma:migrate:dev`
3. Start API: `npm run start:dev`
4. Set base URL variable in Postman: `{{baseUrl}} = http://localhost:3000`

## Environment Variables to Use
- `ownerEmail`
- `memberEmail`
- `outsiderEmail`
- `password`
- `ownerToken`
- `memberToken`
- `outsiderToken`
- `ownerUserId`
- `memberUserId`
- `projectId`

Recommended values:
- `password = Password123`
- emails can be random, for example `owner_{{$timestamp}}@example.com`

## Auth Tests

### 1. Register owner
- Request: `POST {{baseUrl}}/auth/register`
- Body:
```json
{
  "email": "{{ownerEmail}}",
  "password": "{{password}}"
}
```
- Expect:
  - `201 Created`
  - response contains `accessToken`
  - response contains `user.id`, `user.email`
- Save:
  - `ownerToken = accessToken`
  - `ownerUserId = user.id`

### 2. Register member
- Request: `POST {{baseUrl}}/auth/register`
- Body:
```json
{
  "email": "{{memberEmail}}",
  "password": "{{password}}"
}
```
- Expect: `201`, token + user
- Save:
  - `memberToken`
  - `memberUserId`

### 3. Register outsider
- Request: `POST {{baseUrl}}/auth/register`
- Body:
```json
{
  "email": "{{outsiderEmail}}",
  "password": "{{password}}"
}
```
- Expect: `201`, token + user
- Save:
  - `outsiderToken`

### 4. Login owner
- Request: `POST {{baseUrl}}/auth/login`
- Body:
```json
{
  "email": "{{ownerEmail}}",
  "password": "{{password}}"
}
```
- Expect:
  - `201`
  - `accessToken` exists

### 5. Auth me success
- Request: `GET {{baseUrl}}/auth/me`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `200`
  - `user.email == {{ownerEmail}}`

### 6. Auth me without token
- Request: `GET {{baseUrl}}/auth/me`
- Expect:
  - `401`

## Projects Tests (Unified response shape)
All project endpoints should return:
```json
{
  "success": true,
  "data": {}
}
```

### 7. Create project as owner
- Request: `POST {{baseUrl}}/projects`
- Header: `Authorization: Bearer {{ownerToken}}`
- Body:
```json
{
  "name": "Project Alpha",
  "description": "Iteration 2 validation"
}
```
- Expect:
  - `201`
  - `success == true`
  - `data.id` exists
- Save:
  - `projectId = data.id`

### 8. List projects as owner
- Request: `GET {{baseUrl}}/projects`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `200`
  - `success == true`
  - `data` is array

### 9. Get project as owner
- Request: `GET {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `200`
  - `success == true`
  - `data.id == {{projectId}}`

### 10. Add member as owner
- Request: `POST {{baseUrl}}/projects/{{projectId}}/members`
- Header: `Authorization: Bearer {{ownerToken}}`
- Body:
```json
{
  "userId": "{{memberUserId}}"
}
```
- Expect:
  - `201`
  - `success == true`
  - `data.userId == {{memberUserId}}`

### 11. Get project as member
- Request: `GET {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{memberToken}}`
- Expect:
  - `200`
  - `success == true`
  - `data.id == {{projectId}}`

### 12. Outsider cannot update project
- Request: `PATCH {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{outsiderToken}}`
- Body:
```json
{
  "name": "Should fail"
}
```
- Expect:
  - `403`

### 13. Outsider cannot delete project
- Request: `DELETE {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{outsiderToken}}`
- Expect:
  - `403`

### 14. Remove member as owner
- Request: `DELETE {{baseUrl}}/projects/{{projectId}}/members/{{memberUserId}}`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `200`
  - `success == true`
  - `data.removed == true`

### 15. Removed member cannot access project
- Request: `GET {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{memberToken}}`
- Expect:
  - `403`

### 16. Owner updates project
- Request: `PATCH {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{ownerToken}}`
- Body:
```json
{
  "name": "Project Alpha Updated"
}
```
- Expect:
  - `200`
  - `success == true`
  - `data.name == "Project Alpha Updated"`

### 17. Owner deletes project
- Request: `DELETE {{baseUrl}}/projects/{{projectId}}`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `200`
  - `success == true`
  - `data.deleted == true`

## Validation/Edge Cases
### 18. Invalid UUID in project id
- Request: `GET {{baseUrl}}/projects/not-a-uuid`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `400`

### 19. Add non-existing member
- Request: `POST {{baseUrl}}/projects/{{projectId}}/members`
- Header: `Authorization: Bearer {{ownerToken}}`
- Body:
```json
{
  "userId": "11111111-1111-1111-1111-111111111111"
}
```
- Expect:
  - `404`

### 20. Owner cannot remove self from members endpoint
- Request: `DELETE {{baseUrl}}/projects/{{projectId}}/members/{{ownerUserId}}`
- Header: `Authorization: Bearer {{ownerToken}}`
- Expect:
  - `409`
