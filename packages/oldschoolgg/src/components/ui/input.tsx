import * as React from 'react';

import { cn } from '@/lib/utils.js';

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border-2 border-blue-500/20 bg-black/40 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
