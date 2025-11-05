# 3D Gallery Backend (Node.js + Supabase)

A lightweight API gateway over Supabase that mirrors the Postman collection you provided.

## Features
- Folder structure: `config/ constants/ controllers/ models/ routes/ services/ middleware/ app.js`
- Auth: signup / login / refresh / logout (Supabase GoTrue)
- RLS-friendly: user routes forward your Bearer token to Supabase so policies apply
- Admin helper: uses Service Role for server-only ops if needed
- Error handling, logging, security headers, CORS

## Quickstart
1. Copy `.env.sample` to `.env` and fill variables from your Supabase project.
2. `npm i`
3. `npm run dev`
4. `GET /health`

## Route Map
Base path: `/api`

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Protected (require `Authorization: Bearer <access_token>`):
- `GET/POST/PATCH/DELETE /api/users`
- `GET/POST/PATCH/DELETE /api/rooms`
- `GET/POST/PATCH/DELETE /api/room-collaborators`
- `GET/POST/PATCH/DELETE /api/images`
- `GET/POST/PATCH/DELETE /api/object3d`
- `GET/POST/PATCH/DELETE /api/textures`
- `GET/POST/PATCH/DELETE /api/collections`
- `GET/POST/PATCH/DELETE /api/collection-items`
- `GET/POST/PATCH/DELETE /api/magazines`
- `GET/POST/PATCH/DELETE /api/magazine-items`

### Notes
- These routes are thin wrappers. Shape your payloads to match your Supabase tables.
- For server-side operations that should bypass RLS (e.g. seeding), use the service-role client in `services/tableService.js` (admin* functions).

