import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    notFoundComponent: () => (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-7xl font-bold">404</div>
          <a href="/" className="mt-4 inline-block text-primary underline">
            Back to Dashboard
          </a>
        </div>
      </div>
    ),
  },
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
