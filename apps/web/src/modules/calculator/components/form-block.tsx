import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@hitel/ui/components/card';
import { FieldGroup } from '@hitel/ui/components/field';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export const FormBlock = ({ title, description, children }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
    </Card>
  );
};
