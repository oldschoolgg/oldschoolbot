import { calcWhatPercent } from 'e';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { compCapeCategories, compCapeTrimmedRequirements } from '../compCape';

export async function calculateCompCapeProgress(user: MUser) {
	let finalStr = '';

	let totalRequirementsTrimmed = 0;
	let totalCompletedTrimmed = 0;
	let totalCompletedUntrimmed = 0;

	for (const cat of compCapeCategories) {
		const progress = await cat.requirements.check(user);

		let subStr = `${cat.name} (Finished ${progress.metRequirements}/${
			progress.totalRequirements
		}, ${progress.completionPercentage.toFixed(2)}%)\n`;
		for (const reason of progress.reasonsDoesnt) {
			subStr += `	- ${reason}\n`;
		}

		totalRequirementsTrimmed += progress.totalRequirements;
		totalCompletedTrimmed += progress.metRequirements;

		if (cat.name !== 'Trimmed') {
			totalCompletedUntrimmed += progress.metRequirements;
		}

		subStr += '\n\n';
		finalStr += subStr;
	}

	const totalRequirementsUntrimmed = totalRequirementsTrimmed - compCapeTrimmedRequirements.size;

	const totalPercentTrimmed = calcWhatPercent(totalCompletedTrimmed, totalRequirementsTrimmed);
	const totalPercentUntrimmed = calcWhatPercent(totalCompletedUntrimmed, totalRequirementsUntrimmed);

	const trimmedStr = ` ${totalCompletedTrimmed}/${totalRequirementsTrimmed} (${totalPercentTrimmed.toFixed(2)}%)`;
	const untrimmedStr = ` ${totalCompletedUntrimmed}/${totalRequirementsUntrimmed} (${totalPercentUntrimmed.toFixed(
		2
	)}%)`;

	await userStatsUpdate(user.id, {
		comp_cape_percent: totalPercentTrimmed,
		untrimmed_comp_cape_percent: totalPercentUntrimmed
	});

	return {
		resultStr: `Completionist Cape Progress

Trimmed: ${trimmedStr}
Untrimmed: ${untrimmedStr}

${finalStr}`,
		totalPercentTrimmed,
		totalPercentUntrimmed
	};
}
