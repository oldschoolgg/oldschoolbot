// import {
// 	BotIcon,
// 	CaptionsIcon,
// 	ClockIcon,
// 	CloudSunRainIcon,
// 	Grid2x2Icon,
// 	LecternIcon,
// 	Link,
// 	MessageSquareIcon,
// 	MessagesSquareIcon,
// 	Route,
// 	SettingsIcon
// } from 'lucide-react';
// import type React from 'react';
// import { Suspense } from 'react';
// import { useEffect, useState } from 'react';

// import { CopyToClipboard } from '@/components/CopyToClipboard.tsx';
// import { Divider } from '@/components/ui/Divider.tsx';
// import { Separator } from '@/components/ui/separator.tsx';
// import { rawApi, type UserUpdatePayload, type UserWithManageables } from '@/lib/rawApi.ts';
// import { globalState } from '@/lib/state.ts';
// import { OBSBrowserSourceURLModal } from './components/OBSBrowserSourceURL.tsx';
// import { AppSidebar } from './components/SideBar/app-sidebar.tsx';
// import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/SideBar/sidebar.tsx';
// import { DashboardTitle } from './DashboardShared.tsx';
// import { AdminPage } from '@/components/Dashboard/AdminPage.tsx';
// import { navigate } from 'astro:transitions/client';
// import { handleError } from '../../../../server/src/smallUtil.ts';

// export type DashboardSubPageProps = {
// 	activeUser: UserWithManageables['manages'][0];
// 	loggedInUser: UserWithManageables;
// 	loading: boolean;
// 	updateConfig: (data: UserUpdatePayload) => Promise<void>;
// };

// function SettingsPage({ activeUser, loggedInUser }: DashboardSubPageProps) {
// 	const managed = [...loggedInUser.manages].filter(_managed => _managed.id !== loggedInUser.id);

// 	const THEIR_OVERLAY_URL = `${__FRONTEND_URL__}/overlay/${activeUser.id}/${activeUser.overlay_token}`;

// 	return (
// 		<div>
// 			<div>
// 				{/* <div>
// 					<DashboardTitle>Logged in as {loggedInUser.username}</DashboardTitle>
// 					<div>
// 						{loggedInUser.discord_id ? (
// 							<div>
// 								<p className="font-bold">Connected Discord Account:</p>
// 								<DiscordUserCard userId={loggedInUser.discord_id} />
// 							</div>
// 						) : (
// 							<UniqueButton bgColor="bg-[#5865F2]">Connect Your Discord Account</UniqueButton>
// 						)}
// 					</div>
// 				</div> */}
// 				<p>
// 					<span className="font-bold">Logged in as:</span>{' '}
// 					<span className="text-muted-foreground">{loggedInUser.username}</span>
// 				</p>
// 				<p>
// 					<span className="font-bold">Kick Username:</span>{' '}
// 					<span className="text-muted-foreground">{activeUser.kick_user?.slug ?? 'none'}</span>
// 				</p>
// 			</div>

// 			<Divider />
// 			<div className="my-3">
// 				<DashboardTitle>Overlay URL for {activeUser.username}</DashboardTitle>
// 				<CopyToClipboard url={THEIR_OVERLAY_URL} />
// 				<OBSBrowserSourceURLModal url={THEIR_OVERLAY_URL} hdSize />
// 			</div>

// 			<Divider />
// 			<div className="my-3">
// 				<h1 className="font-bold text-3xl mb-1 text-white">Your Managers</h1>
// 				<div className="text-xs text-gray-400 mb-4">Your managers have full access to manage your account.</div>
// 				{loggedInUser.managers.length === 0 ? (
// 					<p className="text-gray-400">You have no managers.</p>
// 				) : (
// 					<p>{loggedInUser.managers.map(m => m.username).join(', ')}</p>
// 				)}
// 			</div>
// 			{managed.length > 0 && (
// 				<>
// 					<Divider />
// 					<div>
// 						<DashboardTitle>Streamers You Manage:</DashboardTitle>{' '}
// 						<div className="flex flex-row flex-wrap gap-2">
// 							{managed.length === 0 ? (
// 								<p className="text-gray-400">You don't manage any other users.</p>
// 							) : (
// 								managed.map(m => (
// 									<Link
// 										key={m.id}
// 										href={`/dashboard/${m.id}`}
// 										className="relative w-40 flex flex-col items-center gap-2 justify-end border rounded-xl p-2 hover:shadow-lg bg-secondary"
// 									>
// 										<img
// 											className="h-16 aspect-square rounded-full"
// 											src={
// 												m.kick_user?.profile_pic_url ??
// 												'https://kick.com/img/default-profile-pictures/default1.jpeg'
// 											}
// 										/>
// 										<div className="relative z-10">
// 											<p className="font-bold text-lg">{m.kick_user?.username}</p>
// 										</div>
// 									</Link>
// 								))
// 							)}
// 						</div>
// 					</div>
// 				</>
// 			)}

// 			{loggedInUser.id !== activeUser.id && (
// 				<div className="p-4 rounded-xl mt-4 text-lg">
// 					<p>You are managing {activeUser.username}'s settings.</p>
// 				</div>
// 			)}
// 		</div>
// 	);
// }

// export type RouteItem = {
// 	icon: React.ReactNode;
// 	title: string;
// 	url: string;
// 	component?: React.FC<DashboardSubPageProps>;
// 	disabled?: boolean;
// };
// export const routes: (
// 	| {
// 			title: string;
// 			icon: any;
// 			items: RouteItem[];
// 			openUrl?: string;
// 	  }
// 	| RouteItem
// )[] = [
// 	{
// 		icon: <SettingsIcon className="h-5" />,
// 		title: 'Settings',
// 		url: '/dashboard/:slug',
// 		component: SettingsPage
// 	},
// 	{
// 		icon: <Grid2x2Icon className="h-5" />,
// 		title: 'Standalone Widgets',
// 		url: '/widgets',
// 		openUrl: '/widgets'
// 	},
// 	{
// 		title: 'Overlay',
// 		icon: <BotIcon className="h-5" />,
// 		items: [
// 			{
// 				icon: <MessagesSquareIcon className="h-5" />,
// 				title: 'Discord Highlights',
// 				url: '/dashboard/:slug/discord-highlights',
// 			},
// 			{
// 				icon: <MessageSquareIcon className="h-5" />,
// 				title: 'Kick Chat',
// 				url: '/dashboard/:slug/kick_chat',
// 			},
// 			{
// 				icon: <CloudSunRainIcon className="h-5" />,
// 				title: 'Weather',
// 				url: '/dashboard/:slug/weather',
// 			},
// 			{
// 				icon: <ClockIcon className="h-5" />,
// 				title: 'Time',
// 				url: '/dashboard/:slug/time',
// 			}
// 		]
// 	},
// 	{
// 		icon: <CaptionsIcon className="h-5" />,
// 		title: 'Custom Commands',
// 		url: '/dashboard/:slug/custom-commands',
// 	},
// 	{
// 		icon: <LecternIcon className="h-5" />,
// 		title: 'Polls',
// 		url: '/dashboard/:slug/polls',
// 	}
// ];

// export const flatRoutes = routes.reduce<RouteItem[]>((acc, item) => {
// 	if ('items' in item) {
// 		return [...acc, ...item.items];
// 	} else {
// 		return [...acc, item];
// 	}
// }, []);

// export function DashboardRoot() {
// 	const user = globalState(s => s.user);
// 	const params = useParams();
// 	const [overlayLoading, setOverlayLoading] = useState(false);

// 	useEffect(() => {
// 		if (!user?.id) {
// 			navigate('/login');
// 			return;
// 		}
// 		rawApi.syncState();
// 	}, [user?.id]);

// 	if (!user) {
// 		return null;
// 	}

// 	if (params.slug === 'admin') {
// 		return (
// 			<Suspense fallback={null}>
// 				<AdminPage />
// 			</Suspense>
// 		);
// 	}

// 	const users = [user, ...(user.manages && Array.isArray(user.manages) ? user.manages : [])];
// 	const activeUser = users.find(_u => _u.id === params.slug);
// 	if (!activeUser) {
// 		return <Redirect to={`/dashboard/${users[0].id}`} />;
// 	}

// 	async function updateConfig(data: UserUpdatePayload) {
// 		setOverlayLoading(true);
// 		console.log('updateConfig', data);
// 		const response = await rawApi.user.update(activeUser!.id, data);
// 		if ('error' in response) {
// 			handleError(new Error(response.error));
// 			alert(`Error updating user config: ${response.error}`);
// 			setOverlayLoading(false);
// 			return;
// 		}
// 		globalState.setState({ user: response });
// 		setOverlayLoading(false);
// 	}

// 	return (
// 		<Suspense fallback={null}>
// 			<SidebarProvider>
// 				<AppSidebar activeUser={activeUser} />
// 				<SidebarInset>
// 					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-[#18181b]">
// 						{/* Breadcrumb
// 						<div className="flex items-center gap-2 px-4">
// 							<SidebarTrigger className="-ml-1" />
// 							<Separator orientation="vertical" className="mr-2 h-4" />
// 							{flatRoutes.map(route => (
// 								<Route key={route.title} path={route.url}>
// 									<div className="flex flex-row gap-3 items-center">
// 										<h1 className="text-xl font-bold hidden md:block">{activeUser.username}</h1>
// 										<svg
// 											class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1 hidden md:block"
// 											aria-hidden="true"
// 											xmlns="http://www.w3.org/2000/svg"
// 											fill="none"
// 											viewBox="0 0 6 10"
// 										>
// 											<path
// 												stroke="currentColor"
// 												stroke-linecap="round"
// 												stroke-linejoin="round"
// 												stroke-width="2"
// 												d="m1 9 4-4-4-4"
// 											/>
// 										</svg>
// 										<h1 className="text-xl font-bold t">{route.title}</h1>
// 									</div>
// 								</Route>
// 							))}
// 						</div>
// 						*/}
// 					</header>
// 					<div
// 						id="dashboard_content_container"
// 						className="flex flex-1 flex-col gap-4 p-8 max-w-screen text-gray-300"
// 						style={{ maxWidth: '100vw' }}
// 					>
// 						<div className="flex-1 rounded-xl md:min-h-min max-w-2xl">
// 							{user !== null && (
// 								<Switch>
// 									{flatRoutes.map(route => (
// 										<Route key={route.title} path={route.url}>
// 											<Suspense fallback={null}>
// 												{user !== null && route.component && (
// 													<route.component
// 														loggedInUser={user}
// 														activeUser={activeUser}
// 														loading={overlayLoading}
// 														updateConfig={data =>
// 															updateConfig({
// 																...data
// 															})
// 														}
// 													/>
// 												)}
// 											</Suspense>
// 										</Route>
// 									))}
// 									<Route path="/dashboard/:slug*">
// 										<p>fallback</p>
// 									</Route>
// 								</Switch>
// 							)}
// 						</div>
// 					</div>
// 				</SidebarInset>
// 			</SidebarProvider>
// 		</Suspense>
// 	);
// }
