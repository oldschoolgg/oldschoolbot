import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils.js';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'xs' | 'lg' | 'icon';

type ButtonProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>;

const baseClasses =
	'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

function buttonClassNames(variant: ButtonVariant = 'default', size: ButtonSize = 'default') {
	let variantClasses: string;
	switch (variant) {
		case 'destructive':
			variantClasses = 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
			break;
		case 'outline':
			variantClasses = 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
			break;
		case 'secondary':
			variantClasses = 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
			break;
		case 'ghost':
			variantClasses = 'hover:bg-accent hover:text-accent-foreground';
			break;
		case 'link':
			variantClasses = 'text-primary underline-offset-4 hover:underline';
			break;
		case 'default':
		default:
			variantClasses = 'bg-[var(--color-primary)] text-primary hover:bg-[--background-secondary]';
			break;
	}

	let sizeClasses: string;
	switch (size) {
		case 'sm':
			sizeClasses = 'h-9 rounded-md px-2';
			break;
		case 'xs':
			sizeClasses = 'h-6 rounded-md px-2 text-xs';
			break;
		case 'lg':
			sizeClasses = 'h-11 rounded-md px-8';
			break;
		case 'icon':
			sizeClasses = 'h-10 w-10';
			break;
		case 'default':
		default:
			sizeClasses = 'h-10 px-4 py-2';
			break;
	}

	return cn(baseClasses, variantClasses, sizeClasses);
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'default', size = 'default', ...props }, ref) => (
		<button ref={ref} className={cn(buttonClassNames(variant, size), className)} {...props} />
	)
);

export { Button };
