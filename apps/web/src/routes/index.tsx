import { createFileRoute } from '@tanstack/react-router';
import { Calculator } from '@/modules/calculator';

export const Route = createFileRoute('/')({
  // The calculator validates the shared state itself (see url-state.ts).
  validateSearch: (search: Record<string, unknown>) => search,
  component: Calculator
});
