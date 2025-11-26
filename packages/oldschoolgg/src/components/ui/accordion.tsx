import { ChevronDown } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface AccordionProps {
	type?: 'single' | 'multiple';
	children: React.ReactNode;
	className?: string;
}

const Accordion = ({ type = 'single', children, className, ...props }: AccordionProps) => {
	const accordionName = React.useId();

	return (
		<div className={className} {...props}>
			{React.Children.map(children, child => {
				if (React.isValidElement(child)) {
					// @ts-expect-error
					return React.cloneElement(child, {
						...(type === 'single' && { name: accordionName })
					});
				}
				return child;
			})}
		</div>
	);
};

interface AccordionItemProps {
	value: string;
	children: React.ReactNode;
	className?: string;
	name?: string;
	defaultOpen?: boolean;
}

const AccordionItem = ({ className, children, name, defaultOpen, ...props }: AccordionItemProps) => {
	return (
		<details
			className={cn('border-b group', className)}
			name={name}
			// @ts-expect-error
			defaultOpen={defaultOpen}
			{...props}
		>
			{children}
		</details>
	);
};

interface AccordionTriggerProps {
	children: React.ReactNode;
	className?: string;
}

const AccordionTrigger = ({ className, children, ...props }: AccordionTriggerProps) => {
	return (
		<summary
			className={cn(
				'flex flex-1 items-center justify-between py-4 font-medium transition-all border-b-2 border-t-2 border-transparent hover:border-white/20 cursor-pointer list-none [&::-webkit-details-marker]:hidden',
				className
			)}
			{...props}
		>
			<div className="flex flex-1 items-center justify-between">
				{children}
				<ChevronDown className="icon-chevron-down h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 contrast-0" />
			</div>
		</summary>
	);
};

interface AccordionContentProps {
	children: React.ReactNode;
	className?: string;
}

const AccordionContent = ({ className, children, ...props }: AccordionContentProps) => {
	return (
		<div className={cn('overflow-hidden text-sm', className)} {...props}>
			<div className="pb-4 pt-0">{children}</div>
		</div>
	);
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
