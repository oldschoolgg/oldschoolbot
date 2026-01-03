import { Bank } from 'oldschooljs';

import { BankImage } from '@/components/BankImage/BankImage.js';
import type { FullMinionData } from '../../../../../robochimp/src/http/api-types.js';

export function MinionInfo({ data }: { data: FullMinionData }) {
	const info = {
		Ironman: data.is_ironman ? 'Yes' : 'No',
		GP: data.gp.toLocaleString(),
		QP: data.qp,
		'Slayer Points': data.slayer_points.toLocaleString(),
		'Collection Log': Object.keys(data.collection_log_bank).length,
		Sacrificed: `${data.total_sacrificed_value.toLocaleString()} GP`
	};
	return (
		<div className="flex items-center justify-center flex-col">
			<div className="p-4 border border-gray-900 rounded mb-4 w-64">
				{Object.entries(info).map(([key, value]) => (
					<div key={key} className="flex justify-between">
						<span className="font-extrabold text-white">{key}:</span>
						<span className="text-gray-300">{value}</span>
					</div>
				))}
			</div>
			<BankImage sort="name" title="Collection Log" bank={new Bank(data.collection_log_bank)} />
		</div>
	);
}
