import { useEffect, useState } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { UserIndentity } from '@/components/UserIdentity.js';
import type { FullMinionData } from '../../../../../robochimp/src/http/api-types.js';

function formatTimestamp(timestamp: string | null) {
	if (!timestamp) {
		return '—';
	}

	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return '—';
	}

	return date.toLocaleString();
}

function formatDuration(milliseconds: number) {
	const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const minutes = totalMinutes % 60;
	const totalHours = Math.floor(totalMinutes / 60);
	const hours = totalHours % 24;
	const days = Math.floor(totalHours / 24);

	const pad = (value: number) => value.toString().padStart(2, '0');
	const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

	return days > 0 ? `${days}d ${timeString}` : timeString;
}

function ActivityCountdown({ finishesAt }: { finishesAt: string | null }) {
	const [remainingMs, setRemainingMs] = useState(() =>
		finishesAt ? new Date(finishesAt).getTime() - Date.now() : 0
	);

	useEffect(() => {
		if (!finishesAt) {
			setRemainingMs(0);
			return;
		}

		const interval = setInterval(() => {
			setRemainingMs(new Date(finishesAt).getTime() - Date.now());
		}, 1000);

		return () => clearInterval(interval);
	}, [finishesAt]);

	if (!finishesAt) {
		return <span className="text-gray-300">—</span>;
	}

	if (remainingMs <= 0) {
		return <span className="text-gray-300">Completed</span>;
	}

	return <span className="text-gray-300">{formatDuration(remainingMs)}</span>;
}

export function MinionInfo({ data }: { data: FullMinionData }) {
	const info = {
		Ironman: data.is_ironman ? 'Yes' : 'No',
		GP: data.gp.toLocaleString(),
		QP: data.qp,
		'Slayer Points': data.slayer_points.toLocaleString(),
		'Collection Log': Object.keys(data.collection_log_bank).length,
		Sacrificed: `${data.total_sacrificed_value.toLocaleString()} GP`
	};
	const currentActivity = data.current_activity;
	return (
		<div className="flex items-center justify-center flex-col">
			<div className="flex items-center flex-col mb-4">
				<p className="text-3xl mb-1">{data.name ?? 'Minion'}</p>
				<UserIndentity userId={data.user_id} />
				<div className="flex flex-row items-center my-2">
					<img
						src={`https://cdn.oldschool.gg/website/${data.bot}-avatar-100.webp`}
						alt=""
						className="w-4 h-4 rounded-full mr-2"
					/>
					<p className="text-xs text-gray-400 uppercase">{data.bot}</p>
				</div>
			</div>

			<div className="p-4 border border-gray-900 rounded mb-4 w-64">
				{Object.entries(info).map(([key, value]) => (
					<div key={key} className="flex justify-between">
						<span className="font-extrabold text-white">{key}:</span>
						<span className="text-gray-300">{value}</span>
					</div>
				))}
			</div>
			<div className="p-4 border border-gray-900 rounded mb-4 w-64">
				<p className="text-center font-semibold mb-2 text-white">Current Activity</p>
				<div className="flex justify-between">
					<span className="font-extrabold text-white">Activity:</span>
					<span className="text-gray-300">{currentActivity?.name ?? 'Idle'}</span>
				</div>
				<div className="flex justify-between">
					<span className="font-extrabold text-white">Started:</span>
					<span className="text-gray-300">{formatTimestamp(currentActivity?.started_at ?? null)}</span>
				</div>
				<div className="flex justify-between">
					<span className="font-extrabold text-white">Ends:</span>
					<span className="text-gray-300">{formatTimestamp(currentActivity?.finishes_at ?? null)}</span>
				</div>
				<div className="flex justify-between">
					<span className="font-extrabold text-white">Countdown:</span>
					<ActivityCountdown finishesAt={currentActivity?.finishes_at ?? null} />
				</div>
			</div>
			<BankImage sort="name" title="Bank" bank={data.bank} />
			<BankImage sort="name" title="Collection Log" bank={data.collection_log_bank} />
		</div>
	);
}
