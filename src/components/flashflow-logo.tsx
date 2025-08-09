import * as React from 'react';
import { cn } from '@/lib/utils';

const FlashFlowLogo = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('h-8 w-8', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" />
      <path d="M20 12h-2" />
      <path d="M6 12H4" />
      <path d="M12 8V6" />
      <path d="M12 18v-2" />
      <path d="m18 6 -1 1" />
      <path d="m7 17-1 1" />
      <path d="m18 18 -1-1" />
      <path d="m7 7 1-1" />
      <path d="m18 12 2-2-2-2" />
    </svg>
  )
);
FlashFlowLogo.displayName = 'FlashFlowLogo';

export default FlashFlowLogo;
