# workforce

This repo is a **TanStack Start (SSR) frontend** in `website/` plus a **Convex backend** in `website/convex/`.

## Deploy (works everywhere Docker works)

### 1) Deploy Convex (backend)

This repo already has a GitHub Action (`.github/workflows/deploy-convex.yml`) that deploys Convex on pushes to `main`.

It expects these secrets:
- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`

### 2) Deploy the TanStack Start app (frontend/SSR server)

The app requires **`VITE_CONVEX_URL` at build time** (Vite embeds `VITE_*` variables).

- **Docker build/run**

```bash
cd website
docker build --build-arg VITE_CONVEX_URL="https://<your-deployment>.convex.cloud" -t workforce-web .
docker run -p 3000:3000 workforce-web
```

- **Docker compose**

```bash
export VITE_CONVEX_URL="https://<your-deployment>.convex.cloud"
docker compose up --build
```
