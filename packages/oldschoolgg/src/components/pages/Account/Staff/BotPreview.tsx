import { timeAgo } from '@/lib/utils.js';
import type { ServiceStatus } from '../../../../../../robochimp/src/structures/ServiceManager.js';

export function BotPreview(_b: ServiceStatus) {
	const online = _b.active && _b.sub_state === 'running';

	const stats = [
		{
			label: 'Status',
			value: online ? (
				<span className="text-green-400">Online</span>
			) : (
				<span className="text-red-400">Offline</span>
			)
		},
		{
			label: 'Uptime',
			value: _b.uptime === null ? 'Never' : timeAgo(new Date(_b.uptime * 1000))
		}
	];
	return (
		<div key={_b.service} className="w-full max-w-lg bg-gray-400/15 p-4 rounded-lg">
			<div className="flex flex-row items-center justify-center gap-2 mb-4">
				<img
					src={`https://cdn.oldschool.gg/website/${_b.service}-avatar-100.webp`}
					className="rounded-full h-6 w-6"
				/>
				<span className="text-gray-100 text-sm">{_b.service.toUpperCase()}</span>
			</div>
			<div className="max-w-64">
				{stats.map(stat => (
					<div key={stat.label} className="">
						<p className="text-gray-300 text-sm">
							<span className="font-bold text-gray-100">{stat.label}:</span> {stat.value}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
