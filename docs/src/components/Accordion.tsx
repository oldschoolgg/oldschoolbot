import React from 'preact/compat';

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
	title: string;
	children: React.ReactNode;
	className?: string;
	name?: string;
	defaultOpen?: boolean;
}

const AccordionItem = ({ className, children, name, defaultOpen, title, ...props }: AccordionItemProps) => {
	return (
		<details
			// @ts-expect-error
			defaultOpen={defaultOpen}
			{...props}
			style={{
				border: '1px solid var(--sl-details-border-color)',
				borderLeft: '4px solid var(--sl-details-border-color)'
			}}
		>
			<summary
				style={{
					display: 'flex',
					flexDirection: 'row-reverse'
				}}
				className="flex flex-row items-center justify-between py-4 font-medium transition-all border-transparent hover:border-orange-700/30 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
			>
				<div className="text-2xl w-max">{title}</div>
			</summary>
			<div className="overflow-hidden text-sm">
				<div className="pb-4 pt-0">{children}</div>
			</div>
		</details>
	);
};

export { Accordion, AccordionItem };
