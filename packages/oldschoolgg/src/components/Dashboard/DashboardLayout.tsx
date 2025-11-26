import type React from 'react';
import { Suspense, useState } from 'react';

import { Separator } from '@/components/ui/separator.tsx';
import { handleError } from '@/lib/handleError.ts';
import { rawApi, type UserUpdatePayload, type UserWithManageables } from '@/lib/rawApi.ts';
import { globalState } from '@/lib/state.ts';
import { AppSidebar } from './components/SideBar/app-sidebar.tsx';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/SideBar/sidebar.tsx';

export type DashboardSubPageProps = {
	activeUser: UserWithManageables['manages'][0];
	loggedInUser: UserWithManageables;
	loading: boolean;
	updateConfig: (data: UserUpdatePayload) => Promise<void>;
};

type DashboardLayoutProps = {
	activeUser: UserWithManageables['manages'][0];
	loggedInUser: UserWithManageables;
	pageTitle: string;
	children: React.ReactNode;
};

export function DashboardLayout({ activeUser, loggedInUser, pageTitle, children }: DashboardLayoutProps) {
	const [overlayLoading, setOverlayLoading] = useState(false);

	async function updateConfig(data: UserUpdatePayload) {
		setOverlayLoading(true);
		console.log('updateConfig', data);
		const response = await rawApi.user.update(activeUser.id, data);
		if ('error' in response) {
			handleError(new Error(response.error));
			alert(`Error updating user config: ${response.error}`);
			setOverlayLoading(false);
			return;
		}
		globalState.setState({ user: response });
		setOverlayLoading(false);
	}

	return (
		<Suspense fallback={null}>
			<SidebarProvider>
				<AppSidebar activeUser={activeUser} />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-[#18181b]">
						{/* Breadcrumb */}
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<div className="flex flex-row gap-3 items-center">
								<h1 className="text-xl font-bold hidden md:block">{activeUser.username}</h1>
								<svg
									class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1 hidden md:block"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 6 10"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="m1 9 4-4-4-4"
									/>
								</svg>
								<h1 className="text-xl font-bold">{pageTitle}</h1>
							</div>
						</div>
					</header>
					<div
						id="dashboard_content_container"
						className="flex flex-1 flex-col gap-4 p-8 max-w-screen text-gray-300"
						style={{ maxWidth: '100vw' }}
					>
						<div className="flex-1 rounded-xl md:min-h-min max-w-2xl">
							{typeof children === 'function'
								? children({ activeUser, loggedInUser, loading: overlayLoading, updateConfig })
								: children}
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</Suspense>
	);
}
