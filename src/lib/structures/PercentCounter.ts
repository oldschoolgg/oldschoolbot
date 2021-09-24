import { formatDuration } from '../util';

export class PercentCounter {
	public value;
	public messages: string[] = [];
	public missed: string[] = [];
	type: string;

	constructor(startingValue: number, type: 'time' | 'percent') {
		this.value = startingValue;
		this.type = type;
	}

	add(isApplying: boolean, percent: number, message: string) {
		let change = this.value * (percent / 100);
		const formattedChange = this.type === 'time' ? formatDuration(change) : `${change.toFixed(2)}%`;
		this[isApplying ? 'messages' : 'missed'].push(`${percent}% (${formattedChange}): ${message}`);
		if (isApplying) this.value -= change;
	}
}
