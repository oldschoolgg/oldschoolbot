import { BankImage } from '@/components/BankImage/BankImage.js';
import { UserIndentity } from '@/components/UserIdentity.js';
import type { FullMinionData } from '../../../../../robochimp/src/http/api-types.js';

export function MinionInfo({ data }: { data: FullMinionData }) {
	const formatRank = (rank: number | null) => (rank ? `#${rank.toLocaleString()}` : 'Unranked');
	const clRank = formatRank(data.leaderboards.cl.overall_rank);
	const clIronmanRank =
		data.is_ironman && data.leaderboards.cl.ironman_rank
			? ` (Ironman ${formatRank(data.leaderboards.cl.ironman_rank)})`
			: '';
	const info = {
		Ironman: data.is_ironman ? 'Yes' : 'No',
		GP: data.gp.toLocaleString(),
		QP: data.qp,
		'Slayer Points': data.slayer_points.toLocaleString(),
		'Collection Log': Object.keys(data.collection_log_bank).length,
		Sacrificed: `${data.total_sacrificed_value.toLocaleString()} GP`,
		'LB CL Overall': `${clRank}${clIronmanRank}`,
		'LB Mastery': formatRank(data.leaderboards.mastery_rank),
		'LB Skills': formatRank(data.leaderboards.skills_rank)
	};
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
			<BankImage sort="name" title="Bank" bank={data.bank} />
			<BankImage sort="name" title="Collection Log" bank={data.collection_log_bank} />
		</div>
	);
}
