'use client';

import * as React from 'react';

import { cn } from '@/lib/utils.js';

type DropdownMenuContextValue = {
	open: boolean;
	setOpen(next: boolean): void;
	triggerRef: React.MutableRefObject<HTMLElement | null>;
	menuRef: React.MutableRefObject<HTMLDivElement | null>;
	menuId: string;
	labelId: string;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
	const ctx = React.useContext(DropdownMenuContext);
	if (!ctx) {
		throw new Error('DropdownMenu components must be used within <DropdownMenu>');
	}
	return ctx;
}

type DropdownMenuProps = {
	children: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?(open: boolean): void;
};

function DropdownMenu({ children, open: controlledOpen, defaultOpen, onOpenChange }: DropdownMenuProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(next);
			}
			if (onOpenChange) {
				onOpenChange(next);
			}
		},
		[isControlled, onOpenChange]
	);

	const triggerRef = React.useRef<HTMLElement | null>(null);
	const menuRef = React.useRef<HTMLDivElement | null>(null);
	const menuId = React.useId();
	const labelId = React.useId();

	React.useEffect(() => {
		if (!open) return;

		function handlePointerDown(event: MouseEvent | TouchEvent) {
			const target = event.target as Node | null;
			if (!target || !menuRef.current || !triggerRef.current) return;
			if (menuRef.current.contains(target) || triggerRef.current.contains(target)) return;
			setOpen(false);
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setOpen(false);
			}
		}

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('touchstart', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('touchstart', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open, setOpen]);

	const value: DropdownMenuContextValue = React.useMemo(
		() => ({
			open,
			setOpen,
			triggerRef,
			menuRef,
			menuId,
			labelId
		}),
		[open, setOpen, menuId, labelId]
	);

	return (
		<DropdownMenuContext.Provider value={value}>
			<div className="relative inline-block text-left">{children}</div>
		</DropdownMenuContext.Provider>
	);
}

type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	asChild?: boolean;
};

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
	({ asChild, className, onClick, onKeyDown, ...props }, forwardedRef) => {
		const { open, setOpen, triggerRef, menuId, labelId } = useDropdownMenuContext();

		const setTriggerNode = (node: HTMLElement | null) => {
			triggerRef.current = node;
			if (typeof forwardedRef === 'function') {
				forwardedRef(node as HTMLButtonElement | null);
			} else if (forwardedRef) {
				(forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current =
					node as HTMLButtonElement | null;
			}
		};

		const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
			if (onClick) onClick(event);
			if (event.defaultPrevented) return;
			setOpen(!open);
		};

		const handleKeyDownInternal: React.KeyboardEventHandler<HTMLButtonElement> = event => {
			if (onKeyDown) onKeyDown(event);
			if (event.defaultPrevented) return;
			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				setOpen(true);
			}
		};

		if (asChild && React.isValidElement(props.children)) {
			const child = props.children as React.ReactElement;
			return React.cloneElement(child, {
				ref: setTriggerNode,
				'aria-haspopup': 'menu',
				'aria-expanded': open,
				'aria-controls': open ? menuId : undefined,
				'aria-labelledby': labelId,
				onClick: handleClick,
				onKeyDown: handleKeyDownInternal,
				className: cn(child.props.className, className)
			});
		}

		return (
			<button
				type="button"
				ref={setTriggerNode as React.RefCallback<HTMLButtonElement>}
				className={className}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				aria-labelledby={labelId}
				onClick={handleClick}
				onKeyDown={handleKeyDownInternal}
				{...props}
			/>
		);
	}
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
	sideOffset?: number;
};

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
	({ className, sideOffset = 4, style, ...props }, ref) => {
		const { open, menuRef, menuId } = useDropdownMenuContext();

		const setMenuNode = (node: HTMLDivElement | null) => {
			menuRef.current = node;
			if (typeof ref === 'function') {
				ref(node);
			} else if (ref) {
				(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
			}
		};

		return (
			<div
				ref={setMenuNode}
				id={menuId}
				role="menu"
				aria-orientation="vertical"
				data-state={open ? 'open' : 'closed'}
				data-side="bottom"
				style={{ ...style, marginTop: sideOffset }}
				className={cn(
					'absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md origin-top-right',
					'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					!open && 'pointer-events-none opacity-0',
					className
				)}
				{...props}
			/>
		);
	}
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	inset?: boolean;
	onSelect?(event: React.MouseEvent<HTMLButtonElement>): void;
};

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
	({ className, inset, disabled, onClick, onSelect, type, ...props }, ref) => {
		const { setOpen } = useDropdownMenuContext();

		const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
			if (disabled) {
				event.preventDefault();
				return;
			}
			if (onClick) onClick(event);
			if (onSelect) onSelect(event);
			if (event.defaultPrevented) return;
			setOpen(false);
		};

		return (
			<button
				ref={ref}
				type={type ?? 'button'}
				role="menuitem"
				disabled={disabled}
				data-disabled={disabled ? '' : undefined}
				className={cn(
					'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
					inset && 'pl-8',
					className
				)}
				onClick={handleClick}
				{...props}
			/>
		);
	}
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

type DropdownMenuLabelProps = React.HTMLAttributes<HTMLDivElement> & {
	inset?: boolean;
};

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
	({ className, inset, ...props }, ref) => {
		const { labelId } = useDropdownMenuContext();

		return (
			<div
				ref={ref}
				id={labelId}
				className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
				{...props}
			/>
		);
	}
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

type DropdownMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
	({ className, ...props }, ref) => (
		<div ref={ref} role="separator" className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
	)
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

type DropdownMenuGroupProps = React.HTMLAttributes<HTMLDivElement>;

function DropdownMenuGroup({ className, ...props }: DropdownMenuGroupProps) {
	return <div role="group" className={className} {...props} />;
}

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuGroup
};
