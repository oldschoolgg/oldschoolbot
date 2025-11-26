import { MenuIcon } from 'lucide-react';
import React, { type ComponentProps, forwardRef, useContext, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/Input/button';
import { cn } from '@/lib/utils.js';
import { Sheet, SheetContent } from './sheet.tsx';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener('change', onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener('change', onChange);
	}, []);

	return !!isMobile;
}

type SidebarContext = {
	state: 'expanded' | 'collapsed';
	open: boolean;
	setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean | ((open: boolean) => boolean)) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}
	return context;
}

const SidebarProvider = forwardRef<
	HTMLDivElement,
	ComponentProps<'div'> & {
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = useState(false);

	const [_open, _setOpen] = useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const nextOpen = typeof value === 'function' ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(nextOpen);
			} else {
				_setOpen(nextOpen);
			}
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open]
	);

	const toggleSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile(v => !v) : setOpen(v => !v);
	}, [isMobile, setOpen]);

	const state: SidebarContext['state'] = open ? 'expanded' : 'collapsed';

	const contextValue = useMemo<SidebarContext>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar
		}),
		[state, open, setOpen, isMobile, openMobile, toggleSidebar]
	);

	return (
		<SidebarContext.Provider value={contextValue}>
			<div
				style={
					{
						'--sidebar-width': SIDEBAR_WIDTH,
						'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
						...(style as any)
					} as React.CSSProperties
				}
				className={cn(
					'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
					className
				)}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	);
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		side?: 'left' | 'right';
		variant?: 'sidebar' | 'floating' | 'inset';
		collapsible?: 'offcanvas' | 'icon' | 'none';
	}
>(({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

	if (collapsible === 'none') {
		return (
			<div
				className={cn('flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground', className)}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile as any} onOpenChange={setOpenMobile} {...props}>
				<SheetContent
					data-sidebar="sidebar"
					data-mobile="true"
					className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
					style={
						{
							'--sidebar-width': SIDEBAR_WIDTH_MOBILE
						} as React.CSSProperties
					}
					side={side}
				>
					<div className="flex h-full w-full flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			ref={ref}
			className="group peer hidden md:block text-sidebar-foreground"
			data-state={state}
			data-collapsible={state === 'collapsed' ? collapsible : ''}
			data-variant={variant}
			data-side={side}
		>
			<div
				className={cn(
					'duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear',
					'group-data-[collapsible=offcanvas]:w-0',
					'group-data-[side=right]:rotate-180',
					variant === 'floating' || variant === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
						: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]'
				)}
			/>
			<div
				className={cn(
					'duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex',
					side === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
					variant === 'floating' || variant === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
						: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
					className
				)}
				{...props}
			>
				<div
					data-sidebar="sidebar"
					className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
				>
					{children}
				</div>
			</div>
		</div>
	);
});
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = forwardRef<React.Ref<typeof Button>, React.ComponentProps<typeof Button>>(
	({ className, onClick, ...props }, ref) => {
		const { toggleSidebar } = useSidebar();

		return (
			<Button
				ref={ref as any}
				data-sidebar="trigger"
				variant="ghost"
				size="icon"
				className={cn('h-7 w-7 md:hidden', className)}
				onClick={event => {
					onClick?.(event);
					toggleSidebar();
				}}
				{...props}
			>
				<MenuIcon className="invert brightness-50 w-7 h-7" />
			</Button>
		);
	}
);
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			ref={ref}
			data-sidebar="rail"
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
				'[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
				'[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
				'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
				'[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
				'[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
				className
			)}
			{...props}
		/>
	);
});
SidebarRail.displayName = 'SidebarRail';

const SidebarInset = forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(({ className, ...props }, ref) => {
	return (
		<main
			ref={ref}
			className={cn(
				'relative flex min-h-svh flex-1 flex-col bg-background',
				'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
				className
			)}
			{...props}
		/>
	);
});
SidebarInset.displayName = 'SidebarInset';

const SidebarHeader = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return <div ref={ref} data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return <div ref={ref} data-sidebar="footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarContent = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="content"
			className={cn(
				'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
				className
			)}
			{...props}
		/>
	);
});
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="group"
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			{...props}
		/>
	);
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarMenu = forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
	<ul ref={ref} data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
	<li ref={ref} data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

type SidebarMenuButtonVariant = 'default' | 'outline';
type SidebarMenuButtonSize = 'default' | 'sm' | 'lg';

type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
	asChild?: boolean;
	isActive?: boolean;
	variant?: SidebarMenuButtonVariant;
	size?: SidebarMenuButtonSize;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
};

function sidebarMenuButtonClassNames({
	variant,
	size
}: {
	variant: SidebarMenuButtonVariant;
	size: SidebarMenuButtonSize;
}) {
	const base =
		'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0';
	const variantClass =
		variant === 'outline'
			? 'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
			: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';
	const sizeClass =
		size === 'sm'
			? 'h-7 text-xs'
			: size === 'lg'
				? 'h-12 text-sm group-data-[collapsible=icon]:!p-0'
				: 'h-8 text-sm';
	return cn(base, variantClass, sizeClass);
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
	(
		{
			asChild = false,
			isActive = false,
			variant = 'default',
			size = 'default',
			tooltip,
			className,
			children,
			...props
		},
		ref
	) => {
		const { isMobile, state } = useSidebar();

		const classes = cn(sidebarMenuButtonClassNames({ variant, size }), className);

		const baseProps = {
			ref,
			'data-sidebar': 'menu-button',
			'data-size': size,
			'data-active': isActive || undefined,
			className: classes,
			...props
		};

		let button: React.ReactElement;

		if (asChild && React.isValidElement(children)) {
			button = React.cloneElement(children as React.ReactElement, {
				...baseProps,
				...children.props
			});
		} else {
			button = (
				<button type="button" {...baseProps}>
					{children}
				</button>
			);
		}

		if (!tooltip) {
			return button;
		}

		const tooltipProps =
			typeof tooltip === 'string'
				? {
						children: tooltip
					}
				: tooltip;

		return (
			<div>
				<div>{button}</div>
				<div side="right" align="center" hidden={state !== 'collapsed' || isMobile} {...tooltipProps} />
			</div>
		);
	}
);

const SidebarMenuSub = forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		data-sidebar="menu-sub"
		className={cn(
			'mx-1.5 flex min-w-0 translate-x-px flex-col gap-1 px-2.5 py-0.5',
			'group-data-[collapsible=icon]:hidden',
			className
		)}
		{...props}
	/>
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = forwardRef<HTMLLIElement, React.ComponentProps<'li'>>((props, ref) => (
	<li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

type SidebarMenuSubButtonSize = 'sm' | 'md';

type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
	asChild?: boolean;
	size?: SidebarMenuSubButtonSize;
	isActive?: boolean;
};

const SidebarMenuSubButton = forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
	({ asChild = false, size = 'md', isActive, className, children, ...props }, ref) => {
		const classes = cn(
			'flex h-10 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
			'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
			size === 'sm' && 'text-xs',
			size === 'md' && 'text-sm',
			'group-data-[collapsible=icon]:hidden',
			className
		);

		const baseProps = {
			ref,
			'data-sidebar': 'menu-sub-button',
			'data-size': size,
			'data-active': isActive || undefined,
			className: classes,
			...props
		};

		if (asChild && React.isValidElement(children)) {
			return React.cloneElement(children as React.ReactElement, {
				...baseProps,
				...children.props
			});
		}

		return <a {...baseProps}>{children}</a>;
	}
);
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
	useSidebar
};
