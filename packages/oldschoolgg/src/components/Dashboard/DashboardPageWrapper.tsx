import type React from 'react';
import { useEffect, useState } from 'react';

import { rawApi, type UserWithManageables } from '@/lib/rawApi.ts';
import { globalState } from '@/lib/state.ts';
import type { DashboardSubPageProps } from './DashboardLayout.tsx';
import { DashboardLayout } from './DashboardLayout.tsx';

type DashboardPageWrapperProps = {
	slug: string;
	pageTitle: string;
	children: (props: DashboardSubPageProps) => React.ReactNode;
};

export function DashboardPageWrapper({ slug, pageTitle, children }: DashboardPageWrapperProps) {
	const user = globalState(s => s.user);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!user?.id) {
			window.location.href = '/login';
			return;
		}
		rawApi.syncState().finally(() => setIsLoading(false));
	}, [user?.id]);

	if (!user || isLoading) {
		return null;
	}

	const users = [user, ...(user.manages && Array.isArray(user.manages) ? user.manages : [])];
	const activeUser = users.find(_u => _u.id === slug);

	if (!activeUser) {
		window.location.href = `/dashboard/${users[0].id}`;
		return null;
	}

	console.log('xxxxxxxxxxxxxxx');

	return (
		<DashboardLayout activeUser={activeUser} loggedInUser={user} pageTitle={pageTitle}>
			{children as any}
		</DashboardLayout>
	);
}
