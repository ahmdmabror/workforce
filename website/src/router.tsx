import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider } from 'convex/react'
import { routeTree } from './routeTree.gen'

function getConvexUrl(): string | undefined {
  // Prefer runtime-injected value (lets Docker/K8s env vars work without rebuilding client assets).
  const injected = (globalThis as any).__CONVEX_URL__ as string | undefined
  if (injected) return injected

  // Server runtime env (TanStack Start SSR runs in Node).
  const fromProcess =
    (globalThis as any).process?.env?.CONVEX_URL ??
    (globalThis as any).process?.env?.VITE_CONVEX_URL
  if (fromProcess) return fromProcess

  // Vite build-time env (browser/client bundle).
  return (import.meta as any).env?.VITE_CONVEX_URL as string | undefined
}

export function getRouter() {
  const convexUrl = getConvexUrl()
  if (!convexUrl) {
    throw new Error(
      [
        'Missing Convex URL.',
        'Set either:',
        '- CONVEX_URL (recommended for server/runtime; supports self-hosted without rebuilding)',
        '- VITE_CONVEX_URL (required if you want the client bundle to have it at build time)',
      ].join('\n'),
    )
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0, // Let React Query handle all caching
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  )

  return router
}
