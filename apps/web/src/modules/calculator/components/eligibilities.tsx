import type { Eligibility } from '@hitel/core/eligibility';
import { PROGRAMS } from '@hitel/core/constants';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from '@hitel/ui/components/item';
import { Marker } from '@hitel/ui/components/marker';
import { Badge } from '@hitel/ui/components/reui/badge';
import { formatHuf } from '@hitel/core/utils/currency';

type Props = {
  eligibility: Eligibility[];
};

export const Eligibilities = ({ eligibility }: Props) => {
  return (
    <section className='flex flex-col gap-3'>
      <Marker variant='separator' render={<h3 />}>
        Állami támogatások
      </Marker>
      <ItemGroup>
        {eligibility.map((item) => (
          <Item key={item.program} variant='outline' size='sm'>
            <ItemContent>
              <ItemTitle>{PROGRAMS[item.program].name}</ItemTitle>
              <ItemDescription>{PROGRAMS[item.program].legalBasis}</ItemDescription>
              {item.reasons.length > 0 && (
                <ul className='text-muted-foreground list-disc pl-4 text-sm'>
                  {item.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </ItemContent>
            <ItemActions className='self-start'>
              <Badge variant={item.eligible ? 'success-light' : 'outline'} radius='full'>
                {item.eligible ? `max. ${formatHuf(item.maxAmount)}` : 'Nem jár'}
              </Badge>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
};
