import { Button } from '@hitel/ui/components/button';
import { CheckIcon, LinkIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

const FEEDBACK_FOR_MS = 2000;

// The URL always holds the current inputs, so sharing is copying it.
export const ShareButton = () => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      // No clipboard outside secure contexts or without permission: the address bar still works.
      setStatus('failed');
    }
    setTimeout(() => setStatus('idle'), FEEDBACK_FOR_MS);
  };

  return (
    <Button variant='outline' onClick={copy} aria-live='polite'>
      {status === 'copied' ? <CheckIcon /> : status === 'failed' ? <XIcon /> : <LinkIcon />}
      {status === 'copied'
        ? 'Link másolva'
        : status === 'failed'
          ? 'Másold a címsorból'
          : 'Link másolása'}
    </Button>
  );
};
