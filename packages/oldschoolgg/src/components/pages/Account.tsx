import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js';
import { api, globalState } from '@/lib/api.js';
import type { FullMinionData } from '../../../../robochimp/src/http/servers/api-types.js';
import { MinionInfo } from './Account/MinionInfo.js';
import { MinionSelector } from './Account/MinionSelector.js';
import { EconomyTransactions } from './Account/Staff/EconomyTransactions.js';
import { StaffIndex } from './Account/Staff/index.js';
import { Two } from './Account/Two.js';

type MinionParams = {
	bot: 'osb' | 'bso';
	userId: string;
} | null;

function parseMinionFromQuery(): MinionParams {
	if (typeof window === 'undefined') return null;
	const params = new URLSearchParams(window.location.search);
	const bot = params.get('bot');
	const userId = params.get('id');

	if (bot && userId && (bot === 'osb' || bot === 'bso')) {
		return { bot, userId };
	}
	return null;
}

function getCurrentTab(): string {
	if (typeof window === 'undefined') return 'minion-info';
	const path = window.location.pathname;

	if (path.startsWith('/account/staff/economy-transactions')) {
		return 'staff-economy-transactions';
	}
	if (path.startsWith('/account/staff')) {
		return 'staff';
	}
	if (path.startsWith('/account/two')) {
		return 'two';
	}
	if (path.startsWith('/account/minion')) {
		return 'minion-info';
	}
	return 'minion-info';
}

export function AccountPage() {
	const state = globalState();
	const [data, setData] = useState<FullMinionData | null>(null);
	const [currentTab, setCurrentTab] = useState(getCurrentTab());
	const [selectedMinion, setSelectedMinion] = useState<MinionParams>(parseMinionFromQuery());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api.syncState();
	}, []);

	useEffect(() => {
		const minion = parseMinionFromQuery();
		setSelectedMinion(minion);
		setLoading(true);

		if (minion) {
			api.minion
				.get(minion.userId, minion.bot)
				.then(setData)
				.finally(() => setLoading(false));
		} else {
			setData(null);
			setLoading(false);
		}
	}, [currentTab]);

	useEffect(() => {
		const handlePopState = () => {
			setCurrentTab(getCurrentTab());
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	const handleTabChange = (href: string) => {
		window.history.pushState({}, '', href);
		setCurrentTab(getCurrentTab());
	};

	const isStaff = state.user?.bits.includes(1) || state.user?.bits.includes(2);

	return (
		<div className="w-full">
			<Tabs value={currentTab} className="w-full">
				<div className="mb-4 flex justify-center mx-auto">
					<TabsList>
						<TabsTrigger value="minion-info" onClick={() => handleTabChange('/account/minion')}>
							Minions
						</TabsTrigger>
						<TabsTrigger value="two" onClick={() => handleTabChange('/account/two')}>
							Two
						</TabsTrigger>
						{isStaff && (
							<TabsTrigger value="staff" onClick={() => handleTabChange('/account/staff')}>
								Staff
							</TabsTrigger>
						)}
					</TabsList>
				</div>

				<TabsContent value="minion-info">
					{loading ? (
						<p className="tcenter h-full">Loading...</p>
					) : selectedMinion && data ? (
						<MinionInfo data={data} />
					) : (
						<MinionSelector />
					)}
				</TabsContent>

				<TabsContent value="two">
					<Two />
				</TabsContent>

				{isStaff && (
					<TabsContent value="staff">
						<StaffIndex />
					</TabsContent>
				)}

				{isStaff && (
					<TabsContent value="staff-economy-transactions">
						<EconomyTransactions />
					</TabsContent>
				)}
			</Tabs>
			<div className="flex w-full justify-center mt-24 gap-8">
				<Button onClick={api.logOut}>Log Out</Button>
			</div>
		</div>
	);
}
