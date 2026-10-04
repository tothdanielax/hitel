import type { ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
};

export const ExternalLink = ({ href, children }: Props) => {
  return (
    <a href={href} target='_blank' rel='noreferrer' className='underline underline-offset-2'>
      {children}
    </a>
  );
};
