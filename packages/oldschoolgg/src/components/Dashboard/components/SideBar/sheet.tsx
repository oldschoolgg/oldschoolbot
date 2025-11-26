import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils.js';

type SheetSide = 'top' | 'bottom' | 'left' | 'right';

type SheetProps = React.PropsWithChildren<{
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?(open: boolean): void;
}> &
	React.HTMLAttributes<HTMLDivElement>;

type SheetInternalControlProps = {
	__open?: boolean;
	__setOpen?: (open: boolean | ((open: boolean) => boolean)) => void;
};

type SheetContentProps = {
	side?: SheetSide;
} & React.HTMLAttributes<HTMLDivElement>;

function sheetContentClassNames(side: SheetSide) {
	const base =
		'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500';

	const sideClass =
		side === 'top'
			? 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top'
			: side === 'bottom'
				? 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
				: side === 'left'
					? 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm'
					: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm';

	return cn(base, sideClass);
}

const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & SheetInternalControlProps>(
	(rawProps, ref) => {
		const { className, __open, __setOpen, ...props } = rawProps;

		if (!__open) return null;

		return (
			<div
				ref={ref}
				data-state={__open ? 'open' : 'closed'}
				className={cn(
					'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
					className
				)}
				onClick={() => __setOpen?.(false)}
				{...props}
			/>
		);
	}
);
SheetOverlay.displayName = 'SheetOverlay';

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>((rawProps, ref) => {
	const props = rawProps as SheetContentProps & SheetInternalControlProps;
	const { side = 'right', className, children, __open, __setOpen, ...rest } = props;

	if (!__open) return null;

	const state = __open ? 'open' : 'closed';

	return (
		<>
			<SheetOverlay __open={__open} __setOpen={__setOpen} />
			<div
				ref={ref}
				data-state={state}
				data-side={side}
				className={cn(sheetContentClassNames(side), className)}
				{...rest}
			>
				{children}
				<button
					type="button"
					onClick={() => __setOpen?.(false)}
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
			</div>
		</>
	);
});
SheetContent.displayName = 'SheetContent';

const Sheet: React.FC<SheetProps> = ({ open: openProp, defaultOpen = false, onOpenChange, children, ...rest }) => {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
	const isControlled = openProp !== undefined;
	const open = isControlled ? !!openProp : uncontrolledOpen;

	const setOpen = React.useCallback(
		(next: boolean | ((prev: boolean) => boolean)) => {
			const value = typeof next === 'function' ? (next as (prev: boolean) => boolean)(open) : next;
			if (!isControlled) {
				setUncontrolledOpen(value);
			}
			onOpenChange?.(value);
		},
		[isControlled, open, onOpenChange]
	);

	const enhanceChildren = (node: React.ReactNode): React.ReactNode => {
		if (!React.isValidElement(node)) return node;

		if (node.type === SheetContent || node.type === SheetOverlay) {
			return React.cloneElement(node, {
				...(node.props as object),
				__open: open,
				__setOpen: setOpen
			} as SheetInternalControlProps);
		}

		if (node.props?.children) {
			return React.cloneElement(node, {
				...(node.props as object),
				children: React.Children.map(node.props.children, enhanceChildren)
			});
		}

		return node;
	};

	return <div {...rest}>{React.Children.map(children, enhanceChildren)}</div>;
};

export { Sheet, SheetContent };
