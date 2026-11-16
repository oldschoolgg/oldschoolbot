import { performance } from 'node:perf_hooks';
import { scheduler } from 'node:timers/promises';

import { globalConfig } from '@/lib/constants.js';

const defaultCryMs = globalConfig.isProduction ? 60 * 1000 : 10 * 1000;

interface FriendlyTaskOptions {
	yieldAfterMs?: number;
	warnAfterMs?: number;
	cryAfterMs?: number;
	data?: any;
	slowLog?: boolean; // Enables slowCheckpoint logging with msg
}

export class FriendlyTask {
	private readonly startedAt = performance.now();
	private lastYieldAt = this.startedAt;

	private yields = 0;
	private iterations = 0;

	private readonly yieldAfterMs: number;
	private readonly warnAfterMs: number;
	private readonly cryAfterMs: number;

	private readonly data: any;
	private readonly slowLog?: string[];

	constructor(
		readonly name: string,
		options: FriendlyTaskOptions = {}
	) {
		this.yieldAfterMs = options.yieldAfterMs ?? 5;
		this.warnAfterMs = options.warnAfterMs ?? 100;
		this.cryAfterMs = options.cryAfterMs ?? defaultCryMs;
		this.data = options.data ?? undefined;
		if (options.slowLog) {
			this.slowLog = [];
		}
	}

	async slowCheckpoint(msg?: string): Promise<void> {
		// Only log if it was explicitly enabled.
		if (msg) this.slowLog?.push(msg);
		console.log(`[${this.name}] Slow checkpoint: ${msg}`);

		return this.checkpoint();
	}
	async checkpoint(): Promise<void> {
		this.iterations++;

		const now = performance.now();

		if (now - this.lastYieldAt < this.yieldAfterMs) {
			return;
		}

		// Todo: Maybe move cry to slowCheckpoint()
		const elapsed = now - this.startedAt;
		if (elapsed > this.cryAfterMs) {
			this.log(elapsed, 'VERY Long Task');
		}

		await scheduler.yield();

		this.yields++;
		this.lastYieldAt = performance.now();
	}

	finish(): void {
		const elapsed = performance.now() - this.startedAt;

		if (elapsed >= this.warnAfterMs) {
			this.log(elapsed, 'Long Task');
		}
	}

	private log(elapsed: number, prefix: string = 'Long task'): void {
		console.log(
			`[${prefix}] ${this.name}: ` +
				`${elapsed.toFixed(1)}ms, ` +
				`${this.iterations} checkpoints, ` +
				`${this.yields} yields`
		);
		void Logging.logClock({
			source: this.name,
			duration: elapsed,
			stack: new Error().stack,
			context: { extra: this.slowLog, ...this.data }
		});
	}
}
