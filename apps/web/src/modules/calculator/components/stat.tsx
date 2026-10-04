import { Paragraph } from '@hitel/ui/components/paragraph';

type Props = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export const Stat = ({ label, value, emphasis = false }: Props) => {
  return (
    <div className='flex flex-col gap-1'>
      <Paragraph as='dt' size={emphasis ? 'sm' : 'xs'} muted>
        {label}
      </Paragraph>
      <Paragraph
        as='dd'
        size={emphasis ? 'xl' : 'sm'}
        weight={emphasis ? 'semibold' : 'normal'}
        numeric
      >
        {value}
      </Paragraph>
    </div>
  );
};
