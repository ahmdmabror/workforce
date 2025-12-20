# Workforce

A monorepo managed with Bun workspaces.

## Structure

```
workforce/
├── apps/
│   └── nextjs/          # Next.js 15 web application
├── packages/
│   ├── convex/          # Convex backend functions & schema
│   ├── orpc-contract/   # oRPC type-safe API contracts
│   └── orpc-service/    # oRPC service implementations
└── package.json         # Root workspace configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1.38 or later

### Installation

```bash
bun install
```

### Development

Start all services:

```bash
bun run dev
```

Start only the Next.js app:

```bash
bun run dev:web
```

Start only Convex:

```bash
bun run dev:convex
```

### Building

```bash
bun run build
```

## Packages

### `@workforce/nextjs`

The main Next.js 15 web application with Turbopack.

### `@workforce/convex`

Convex backend with real-time database and serverless functions.
