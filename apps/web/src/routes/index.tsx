import { createFileRoute } from '@tanstack/react-router';
import { Calculator } from '@/modules/calculator';

export const Route = createFileRoute('/')({
  component: Calculator
});
