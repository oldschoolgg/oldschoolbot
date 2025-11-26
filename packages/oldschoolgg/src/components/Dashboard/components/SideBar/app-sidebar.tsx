import { ChevronDown, MenuIcon } from 'lucide-react';

import type { IPublicUser } from '@worp/worp-schemas';

import { Logo } from '@/components/Logo.js';
import { rawApi } from '@/lib/rawApi.ts';
import { globalState } from '@/lib/state.ts';
import { flatRoutes, type RouteItem, routes } from '../../routes.tsx';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '../dropdown-menu.tsx';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar
} from './sidebar.tsx';

function NavUser({ user }: { user: IPublicUser }) {
	const state = globalState();
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.username}</span>
							</div>
							<MenuIcon className="invert scale-75 ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.username}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-xs text-muted-foreground">Accounts</DropdownMenuLabel>
							{[state.user, ...(state.user?.manages ?? [])]
								.filter(i => i !== null)
								.map(u => (
									<DropdownMenuItem
										key={u.id}
										onClick={() => (window.location.href = `/dashboard/${u.id}`)}
										className="gap-2 p-2 cursor-pointer"
										disabled={u.id === user.id}
									>
										{u.username}
									</DropdownMenuItem>
								))}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								rawApi.user.logOut().catch(console.error);
								localStorage.clear();
								globalState.setState({
									user: null
								});
								window.location.href = '/';
							}}
						>
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function NavLink({
	item,
	user,
	active,
	className
}: {
	item: RouteItem;
	user: IPublicUser;
	active: boolean;
	className?: string;
}) {
	const { setOpenMobile } = useSidebar();
	const activeClassName = 'font-bold rounded bg-[--background-secondary]';

	const isOpenUrl = 'openUrl' in item && item.openUrl;

	return (
		<SidebarMenuSubItem
			key={item.title}
			className={[
				className,
				active ? activeClassName : '',
				item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
			]}
		>
			<SidebarMenuSubButton asChild>
				<a
					href={item.url.replace(':slug', user.id)}
					onClick={() => setOpenMobile(false)}
					target={isOpenUrl ? '_blank' : undefined}
				>
					{item.icon}
					<span>{item.title}</span>
				</a>
			</SidebarMenuSubButton>
		</SidebarMenuSubItem>
	);
}

function NavMain({ user }: { user: IPublicUser }) {
	const path = typeof window !== 'undefined' ? window.location.pathname : '';

	const activeURL = [...flatRoutes].find(r => r.url.split('/')[3] === path.split('/')[3])?.url;
	return (
		<SidebarGroup>
			<SidebarMenu>
				{routes.map(item =>
					'items' in item ? (
						<SidebarMenuItem>
							<SidebarMenuButton tooltip={item.title} size="lg" variant="default">
								{item.icon}
								<span>{item.title}</span>
								<ChevronDown className="scale-50 contrast-0 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
							</SidebarMenuButton>
							<SidebarMenuSub>
								{item.items?.map(subItem => (
									<NavLink
										key={subItem.url}
										item={subItem}
										active={subItem.url === activeURL}
										user={user}
									/>
								))}
							</SidebarMenuSub>
						</SidebarMenuItem>
					) : (
						<NavLink key={item.url} item={item} active={item.url === activeURL} user={user} />
					)
				)}
			</SidebarMenu>
		</SidebarGroup>
	);
}

export function AppSidebar({
	activeUser,
	...props
}: React.ComponentProps<typeof Sidebar> & { activeUser: IPublicUser }) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center justify-center">
					<Logo />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain user={activeUser} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={activeUser} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
