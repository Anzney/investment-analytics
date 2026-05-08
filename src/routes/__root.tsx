import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Investment Performance Agent" },
      { name: "description", content: "AI-powered family-office investment tracking & analytics." },
      { property: "og:title", content: "Investment Performance Agent" },
      { name: "twitter:title", content: "Investment Performance Agent" },
      { property: "og:description", content: "AI-powered family-office investment tracking & analytics." },
      { name: "twitter:description", content: "AI-powered family-office investment tracking & analytics." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92324ed5-26b8-4022-86e7-222955da4b20/id-preview-9b5706a5--434488c9-7447-4319-a11e-ea50f2673b3d.lovable.app-1778137795194.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92324ed5-26b8-4022-86e7-222955da4b20/id-preview-9b5706a5--434488c9-7447-4319-a11e-ea50f2673b3d.lovable.app-1778137795194.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <div className="text-7xl font-bold">404</div>
        <a href="/" className="mt-4 inline-block text-primary underline">Back to Dashboard</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
