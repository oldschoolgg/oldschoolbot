// import { Collection, DiscordjsTypeError, flatten } from "@oldschoolgg/discord.js";
// import { TimerManager } from "@sapphire/timer-manager";
// import { AsyncEventEmitter } from "@vladfrangu/async_event_emitter";

// export type CollectorFilter = (...args: any[]) => boolean | Promise<boolean>;

// export interface CollectorOptions {
// 	filter?: CollectorFilter;
// 	time?: number;
// 	idle?: number;
// 	dispose?: boolean;
// }

// export interface CollectorResetTimerOptions {
// 	time?: number;
// 	idle?: number;
// }

// export class Collector extends AsyncEventEmitter {
// 	public readonly client: any;
// 	public filter: CollectorFilter;
// 	public options: CollectorOptions;
// 	public collected: Collection<string, any>;
// 	public ended: boolean;
// 	public lastCollectedTimestamp: number | null;
// 	protected _timeout: NodeJS.Timeout | null;
// 	protected _idletimeout: NodeJS.Timeout | null;
// 	protected _endReason: string | null;

// 	constructor(client: any, options: CollectorOptions = {}) {
// 		super();
// 		Object.defineProperty(this, 'client', { value: client });
// 		this.filter = options.filter ?? (() => true);
// 		this.options = options;
// 		this.collected = new Collection();
// 		this.ended = false;
// 		this._timeout = null;
// 		this._idletimeout = null;
// 		this._endReason = null;
// 		this.handleCollect = this.handleCollect.bind(this);
// 		this.handleDispose = this.handleDispose.bind(this);
// 		if (options.time) this._timeout = TimerManager.setTimeout(() => this.stop('time'), options.time).unref();
// 		if (options.idle) this._idletimeout = TimerManager.setTimeout(() => this.stop('idle'), options.idle).unref();
// 		this.lastCollectedTimestamp = null;
// 	}

// 	get lastCollectedAt(): Date | null {
// 		return this.lastCollectedTimestamp ? new Date(this.lastCollectedTimestamp) : null;
// 	}

// 	async handleCollect(...args: any[]) {
// 		const collectedId = await this.collect(...args);
// 		if (collectedId) {
// 			const filterResult = await this.filter(...args, this.collected);
// 			if (filterResult) {
// 				this.collected.set(collectedId, args[0]);
// 				this.emit('collect', ...args);
// 				this.lastCollectedTimestamp = Date.now();
// 				if (this._idletimeout) {
// 					TimerManager.clearTimeout(this._idletimeout);
// 					this._idletimeout = TimerManager.setTimeout(() => this.stop('idle'), this.options.idle).unref();
// 				}
// 			} else {
// 				this.emit('ignore', ...args);
// 			}
// 		}
// 		this.checkEnd();
// 	}

// 	async handleDispose(...args: any[]) {
// 		if (!this.options.dispose) return;
// 		const dispose = this.dispose(...args);
// 		if (!dispose || !(await this.filter(...args)) || !this.collected.has(dispose)) return;
// 		this.collected.delete(dispose);
// 		this.emit('dispose', ...args);
// 		this.checkEnd();
// 	}

// 	get next(): Promise<any> {
// 		return new Promise((resolve, reject) => {
// 			if (this.ended) {
// 				reject(this.collected);
// 				return;
// 			}
// 			const cleanup = () => {
// 				this.removeListener('collect', onCollect);
// 				this.removeListener('end', onEnd);
// 			};
// 			const onCollect = (item: any) => {
// 				cleanup();
// 				resolve(item);
// 			};
// 			const onEnd = () => {
// 				cleanup();
// 				reject(this.collected);
// 			};
// 			this.on('collect', onCollect);
// 			this.on('end', onEnd);
// 		});
// 	}

// 	stop(reason = 'user') {
// 		if (this.ended) return;
// 		if (this._timeout) {
// 			clearTimeoutFn(this._timeout);
// 			this._timeout = null;
// 		}
// 		if (this._idletimeout) {
// 			clearTimeoutFn(this._idletimeout);
// 			this._idletimeout = null;
// 		}
// 		this._endReason = reason;
// 		this.ended = true;
// 		this.emit('end', this.collected, reason);
// 	}

// 	resetTimer({ time, idle }: CollectorResetTimerOptions = {}) {
// 		if (this._timeout) {
// 			TimerManager.clearTimeout(this._timeout);
// 			this._timeout = setTimeoutFn(() => this.stop('time'), time ?? this.options.time).unref();
// 		}
// 		if (this._idletimeout) {
// 			TimerManager.clearTimeout(this._idletimeout);
// 			this._idletimeout = setTimeoutFn(() => this.stop('idle'), idle ?? this.options.idle).unref();
// 		}
// 	}

// 	checkEnd(): boolean {
// 		const reason = this.endReason;
// 		if (reason) this.stop(reason);
// 		return Boolean(reason);
// 	}

// 	async *[Symbol.asyncIterator](): AsyncGenerator<any[], void, unknown> {
// 		const queue: any[][] = [];
// 		const onCollect = (...item: any[]) => queue.push(item);
// 		this.on('collect', onCollect);
// 		try {
// 			while (queue.length || !this.ended) {
// 				if (queue.length) {
// 					yield queue.shift()!;
// 				} else {
// 					await new Promise<void>(resolve => {
// 						const tick = () => {
// 							this.removeListener('collect', tick);
// 							this.removeListener('end', tick);
// 							resolve();
// 						};
// 						this.on('collect', tick);
// 						this.on('end', tick);
// 					});
// 				}
// 			}
// 		} finally {
// 			this.removeListener('collect', onCollect);
// 		}
// 	}

// 	toJSON() {
// 		return flatten(this);
// 	}

// 	get endReason(): string | null {
// 		return this._endReason;
// 	}

// 	// To be overridden
// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	protected collect(..._args: any[]): string | null | Promise<string | null> {
// 		return null;
// 	}

// 	// To be overridden
// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	protected dispose(..._args: any[]): string | null {
// 		return null;
// 	}
// }
