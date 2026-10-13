import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { TooltipProvider } from '@hitel/ui/components/tooltip';
import globalsCss from '@hitel/ui/globals.css?url';
import { APP_NAME, APP_DESCRIPTION, THEME_SCRIPT } from '@/constants';

const RootDocument = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='hu' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: APP_NAME },
      { name: 'description', content: APP_DESCRIPTION },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0a0a0a' },
      { property: 'og:title', content: APP_NAME },
      { property: 'og:description', content: APP_DESCRIPTION },
      { property: 'og:type', content: 'website' }
    ],
    links: [
      { rel: 'stylesheet', href: globalsCss },
      { rel: 'icon', type: 'image/svg+xml', href: `${import.meta.env.BASE_URL}favicon.svg` },
      { rel: 'apple-touch-icon', href: `${import.meta.env.BASE_URL}apple-touch-icon.png` }
    ]
  }),
  shellComponent: RootDocument,
  component: Outlet
});
