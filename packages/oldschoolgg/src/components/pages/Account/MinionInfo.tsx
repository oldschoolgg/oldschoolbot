import { Bank } from 'oldschooljs';

import { BankImage } from '@/components/BankImage/BankImage.js';
import type { FullMinionData } from '../../../../../robochimp/src/http/api-types.js';

export function MinionInfo({ data }: { data: FullMinionData }) {
	return (
		<div>
			<div className="p-4 border border-gray-900 rounded mb-4">
				{data.is_ironman ? <p>You are an Ironman!</p> : <p>You are not an Ironman.</p>}
			</div>
			<BankImage sort="name" title="Collection Log" bank={new Bank(data.collection_log_bank)} />
		</div>
	);
}
