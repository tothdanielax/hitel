import { DEFAULT_SETTINGS } from '@hitel/core/settings';
import { Button } from '@hitel/ui/components/button';
import { Checkbox } from '@hitel/ui/components/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@hitel/ui/components/collapsible';
import { Field, FieldLabel } from '@hitel/ui/components/field';
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle
} from '@hitel/ui/components/reui/frame';
import { useStore } from '@tanstack/react-form';
import { ChevronDownIcon, RotateCcwIcon } from 'lucide-react';
import { formatDate } from '@hitel/core/utils/date';
import { formatPercent, inRange } from '@hitel/core/utils/math';
import { INPUT_LIMITS, RATE_STEP } from '../constants';
import type { CalculatorForm } from '../hooks/use-calculator-form';
import { ExternalLink } from './external-link';
import { FormBlock } from './form-block';

type Props = {
  form: CalculatorForm;
};

const KIND_LABEL = {
  MARKET: 'Piaci',
  MFL: 'Minősített Fogyasztóbarát',
  OTTHON_START: 'Otthon Start'
} as const;

export const BankOffersBlock = ({ form }: Props) => {
  const offers = useStore(form.store, (state) => state.values.settings.offers);

  return (
    <FormBlock
      title='Banki ajánlatok'
      description='Nincs nyilvános banki API, ezért a kamatok kézzel frissített alapértékek. Írd át a saját ajánlatodra.'
    >
      <Collapsible>
        <CollapsibleTrigger render={<Button variant='outline' className='group w-full' />}>
          Kamatok szerkesztése ({offers.filter((offer) => offer.enabled).length}/{offers.length})
          <ChevronDownIcon className='transition-transform group-data-panel-open:rotate-180' />
        </CollapsibleTrigger>
        <CollapsibleContent className='flex flex-col gap-4 pt-4'>
          <Button
            type='button'
            variant='ghost'
            className='self-start'
            onClick={() => form.setFieldValue('settings.offers', DEFAULT_SETTINGS.offers)}
          >
            <RotateCcwIcon />
            Alapértékek visszaállítása
          </Button>
          {[
            ...Map.groupBy(
              offers.map((offer, index) => ({ offer, index })),
              ({ offer }) => offer.bankName
            )
          ].map(([bankName, bankOffers]) => {
            const enabledCount = bankOffers.filter(({ offer }) => offer.enabled).length;
            return (
              <Frame key={bankName} spacing='sm'>
                <FrameHeader className='flex-row items-center justify-between gap-3'>
                  <FrameTitle>{bankName}</FrameTitle>
                  <Field orientation='horizontal' className='w-auto shrink-0'>
                    <Checkbox
                      id={`bank-${bankName}`}
                      checked={enabledCount === bankOffers.length}
                      indeterminate={enabledCount > 0 && enabledCount < bankOffers.length}
                      onCheckedChange={(checked) =>
                        bankOffers.forEach(({ index }) =>
                          form.setFieldValue(`settings.offers[${index}].enabled`, checked)
                        )
                      }
                    />
                    <FieldLabel htmlFor={`bank-${bankName}`} className='font-normal'>
                      Mind
                    </FieldLabel>
                  </Field>
                </FrameHeader>
                {bankOffers.map(({ offer, index }) => (
                  <FramePanel key={offer.id} className='flex flex-col gap-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex min-w-0 flex-col gap-0.5'>
                        <FrameTitle>{offer.product}</FrameTitle>
                        <FrameDescription className='text-xs'>
                          {KIND_LABEL[offer.kind]}
                          {offer.thm !== undefined && `, THM ${formatPercent(offer.thm)}`}
                          {', forrás: '}
                          <ExternalLink href={offer.source.url}>
                            {formatDate(offer.source.asOf)}
                          </ExternalLink>
                        </FrameDescription>
                      </div>
                      <form.AppField name={`settings.offers[${index}].enabled`}>
                        {(field) => <field.CheckboxField label='Számol' />}
                      </form.AppField>
                    </div>
                    <div className='flex flex-col gap-4 sm:flex-row'>
                      <form.AppField
                        name={`settings.offers[${index}].annualRate`}
                        validators={{ onChange: inRange(INPUT_LIMITS.rate, formatPercent) }}
                      >
                        {(field) => <field.NumberField label='Kamat' step={RATE_STEP} percent />}
                      </form.AppField>
                      <form.AppField
                        name={`settings.offers[${index}].fixationYears`}
                        validators={{ onChange: inRange(INPUT_LIMITS.fixationYears) }}
                      >
                        {(field) => (
                          <field.NumberField
                            label='Kamatfixálás'
                            unit='év'
                            description='0 = a teljes futamidőre fix'
                          />
                        )}
                      </form.AppField>
                    </div>
                  </FramePanel>
                ))}
              </Frame>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </FormBlock>
  );
};
