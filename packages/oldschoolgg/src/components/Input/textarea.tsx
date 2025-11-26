import { cn } from '@/lib/utils';

export const Textarea = ({ className, ...props }: React.ComponentProps<'textarea'>) => (
	<textarea
		className={cn(
			'flex min-h-[80px] w-full rounded-md border-2 border-blue-500/20 bg-black/40 px-3 py-2 text-base',
			'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
			'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className
		)}
		{...props}
	/>
);
