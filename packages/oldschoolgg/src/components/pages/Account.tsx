import { useEffect, useState } from 'react';

import { api, globalState } from '@/lib/api.js';
import type { FullMinionData } from '../../../../robochimp/src/http/api-types.js';
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

function getCurrentPage(): string {
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
	const [currentPage, setCurrentPage] = useState(getCurrentPage());
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
	}, [currentPage]);

	useEffect(() => {
		const handlePopState = () => {
			setCurrentPage(getCurrentPage());
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	const isStaff = state.user?.bits.includes(1) || state.user?.bits.includes(2);

	const renderContent = () => {
		switch (currentPage) {
			case 'minion-info':
				return loading ? (
					<p className="tcenter h-full">Loading...</p>
				) : selectedMinion && data ? (
					<MinionInfo data={data} />
				) : (
					<MinionSelector />
				);
			case 'two':
				return <Two />;
			case 'staff':
				return isStaff ? <StaffIndex /> : null;
			case 'staff-economy-transactions':
				return isStaff ? <EconomyTransactions /> : null;
			default:
				return <MinionSelector />;
		}
	};

	return <div className="w-full">{renderContent()}</div>;
}
