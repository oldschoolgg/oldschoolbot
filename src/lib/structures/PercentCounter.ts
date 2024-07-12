import { formatDuration } from '../util';

export class PercentCounter {
	public value: number;
	public messages: string[] = [];
	public missed: string[] = [];
	type: string;

	constructor(startingValue: number, type: 'time' | 'percent') {
		this.value = startingValue;
		this.type = type;
	}

	add(isApplying: boolean, percent: number, message: string) {
		const change = this.value * (percent / 100);

		const formattedChange = this.type === 'time' ? formatDuration(change, true) : `${change.toFixed(2)}%`;
		this[isApplying ? 'messages' : 'missed'].push(
			`${percent}%${this.type !== 'percent' ? `(${formattedChange})` : ''}: ${message}`
		);
		if (isApplying) this.value += change;
		if (this.type === 'percent') {
			this.value = Math.min(100, this.value);
		}
	}
}
