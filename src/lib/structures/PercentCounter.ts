export class PercentCounter {
	public value;
	public messages: string[] = [];

	constructor(startingValue: number) {
		this.value = startingValue;
	}

	add(percent: number, message: string) {
		this.messages.push(`${percent}%: ${message}`);
		this.value -= this.value * (percent / 100);
	}
}
