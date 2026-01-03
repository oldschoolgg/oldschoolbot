import { useInterval } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';

import { BotPreview } from '@/components/pages/Account/Staff/BotPreview.js';
import { api } from '@/lib/api.js';
import type { ServiceStatus } from '../../../../../../robochimp/src/structures/ServiceManager.js';

export function StaffIndex() {
	const [bots, setBots] = useState<ServiceStatus[] | null>(null);

	const fetchBots = useCallback(
		() =>
			api.staff
				.getBots()
				.then(setBots)
				.catch(err => {
					console.error('Error fetching bots status:', err);
				}),
		[]
	);

	useEffect(() => {
		fetchBots();
	}, []);

	useInterval(
		() => {
			fetchBots();
		},
		10_000,
		{
			autoInvoke: true
		}
	);

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4 text-center">Staff Page</h1>
			<h1 className="text-2xl font-bold mb-4">Bots</h1>
			<div className="flex flex-row gap-4 mb-8 max-w-5xl">
				{bots?.map(_b => (
					<BotPreview key={_b.service} {..._b} />
				))}
			</div>
			<h1 className="text-2xl font-bold mb-4">Pages</h1>
			<div className="">
				<a href="/account/staff/economy-transactions" className="text-blue-500 underline hover:text-blue-600">
					Economy Transactions
				</a>
			</div>
		</div>
	);
}
