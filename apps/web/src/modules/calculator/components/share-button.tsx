import { Button } from '@hitel/ui/components/button';
import { CheckIcon, LinkIcon } from 'lucide-react';
import { useState } from 'react';

const COPIED_FOR_MS = 2000;

// The URL always holds the current inputs, so sharing is copying it.
export const ShareButton = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FOR_MS);
  };

  return (
    <Button variant='outline' onClick={copy}>
      {copied ? <CheckIcon /> : <LinkIcon />}
      {copied ? 'Link másolva' : 'Link másolása'}
    </Button>
  );
};
