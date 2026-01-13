import type { HTMLAttributes } from 'react';

export const Label = ({ className, htmlFor, ...props }: { htmlFor?: string } & HTMLAttributes<HTMLLabelElement>) => (
	<label
		htmlFor={htmlFor}
		className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
		{...props}
	/>
);
