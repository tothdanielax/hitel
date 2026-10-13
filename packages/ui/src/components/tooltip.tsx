import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from 'cn';
import { createContext, use, type ComponentProps, type ReactElement } from 'react';
import { useHasHover } from '../hooks/use-has-hover';

const HasHoverContext = createContext(true);

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot='tooltip-provider' delay={delay} {...props} />;
}

// Touch devices have no hover, so there the tooltip renders as a popover that opens on tap.
function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  const hasHover = useHasHover();

  return (
    <HasHoverContext value={hasHover}>
      {hasHover ? (
        <TooltipPrimitive.Root data-slot='tooltip' {...props} />
      ) : (
        <PopoverPrimitive.Root data-slot='tooltip'>{props.children}</PopoverPrimitive.Root>
      )}
    </HasHoverContext>
  );
}

// Plain button props plus an element `render`: the only shape both primitives accept.
function TooltipTrigger({
  nativeButton,
  ...props
}: ComponentProps<'button'> & { render?: ReactElement; nativeButton?: boolean }) {
  return use(HasHoverContext) ? (
    <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />
  ) : (
    <PopoverPrimitive.Trigger data-slot='tooltip-trigger' nativeButton={nativeButton} {...props} />
  );
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: ComponentProps<'div'> &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  const { Portal, Positioner, Popup, Arrow } = use(HasHoverContext)
    ? TooltipPrimitive
    : PopoverPrimitive;

  return (
    <Portal>
      <Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className='isolate z-50'
      >
        <Popup
          data-slot='tooltip-content'
          className={cn(
            'z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        >
          {children}
          <Arrow className='bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5' />
        </Popup>
      </Positioner>
    </Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
