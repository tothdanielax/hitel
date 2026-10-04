import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import globalsCss from '@hitel/ui/globals.css?url';
import { APP_NAME, APP_DESCRIPTION } from '@/constants';

const RootDocument = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='hu'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
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
      { name: 'description', content: APP_DESCRIPTION }
    ],
    links: [{ rel: 'stylesheet', href: globalsCss }]
  }),
  shellComponent: RootDocument,
  component: Outlet
});
