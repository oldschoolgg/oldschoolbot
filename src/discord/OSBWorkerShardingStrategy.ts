import { once } from 'node:events';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import {
	type FetchingStrategyOptions,
	type IIdentifyThrottler,
	type IShardingStrategy,
	managerToFetchingStrategyOptions,
	type WebSocketManager,
	type WebSocketShardDestroyOptions,
	type WebSocketShardStatus,
	type WorkerReceivePayload,
	WorkerReceivePayloadOp,
	type WorkerSendPayload,
	WorkerSendPayloadOp,
	type WorkerShardingStrategyOptions
} from '@discordjs/ws';

export class OSBWorkerShardingStrategy implements IShardingStrategy {
	private readonly manager: WebSocketManager;
	private readonly options: WorkerShardingStrategyOptions;
	private readonly workerByShardId = new Map<number, Worker>();
	private readonly connectPromises = new Map<number, () => void>();
	private readonly destroyPromises = new Map<number, () => void>();
	private readonly fetchStatusPromises = new Map<number, (status: WebSocketShardStatus) => void>();
	private readonly waitForIdentifyControllers = new Map<number, AbortController>();
	private throttler: IIdentifyThrottler | null = null;

	constructor(manager: WebSocketManager, options: WorkerShardingStrategyOptions) {
		this.manager = manager;
		this.options = options;
	}

	async spawn(shardIds: number[]): Promise<void> {
		const shardsPerWorker = this.options.shardsPerWorker === 'all' ? shardIds.length : this.options.shardsPerWorker;
		const strategyOptions = await managerToFetchingStrategyOptions(this.manager);
		const loops = Math.ceil(shardIds.length / shardsPerWorker);
		const promises = [];
		for (let idx = 0; idx < loops; idx++) {
			const slice = shardIds.slice(idx * shardsPerWorker, (idx + 1) * shardsPerWorker);
			promises.push(this.setupWorker({ ...strategyOptions, shardIds: slice }));
		}
		await Promise.all(promises);
	}

	async connect(): Promise<void> {
		const promises = [];
		for (const [shardId, worker] of this.workerByShardId.entries()) {
			promises.push(
				new Promise<void>(resolve => {
					this.connectPromises.set(shardId, resolve);
					worker.postMessage({ op: WorkerSendPayloadOp.Connect, shardId } satisfies WorkerSendPayload);
				})
			);
		}
		await Promise.all(promises);
	}

	async destroy(options?: Omit<WebSocketShardDestroyOptions, 'recover'>): Promise<void> {
		await Promise.all([...this.workerByShardId.keys()].map(shardId => this.destroyShard(shardId, options)));
		this.workerByShardId.clear();
	}

	async send(shardId: number, payload: any): Promise<void> {
		const worker = this.workerByShardId.get(shardId);
		if (!worker) throw new RangeError(`Shard ${shardId} not found`);
		worker.postMessage({ op: WorkerSendPayloadOp.Send, payload, shardId } satisfies WorkerSendPayload);
	}

	async fetchStatus(): Promise<any> {
		const statuses = new Map<number, WebSocketShardStatus>();
		for (const [shardId, worker] of this.workerByShardId.entries()) {
			const nonce = Math.random();
			const promise = new Promise<WebSocketShardStatus>(resolve => this.fetchStatusPromises.set(nonce, resolve));
			worker.postMessage({ op: WorkerSendPayloadOp.FetchStatus, shardId, nonce } satisfies WorkerSendPayload);
			statuses.set(shardId, await promise);
		}
		return statuses;
	}

	async restartShard(shardId: number, options?: Omit<WebSocketShardDestroyOptions, 'recover'>): Promise<void> {
		const worker = this.workerByShardId.get(shardId);
		if (!worker) throw new RangeError(`Shard ${shardId} not found`);
		await this.destroyShard(shardId, options);
		await new Promise<void>(resolve => {
			this.connectPromises.set(shardId, resolve);
			worker.postMessage({ op: WorkerSendPayloadOp.Connect, shardId } satisfies WorkerSendPayload);
		});
	}

	private async destroyShard(
		shardId: number,
		options?: Omit<WebSocketShardDestroyOptions, 'recover'>
	): Promise<void> {
		const worker = this.workerByShardId.get(shardId);
		if (!worker) throw new RangeError(`Shard ${shardId} not found`);
		await new Promise<void>(resolve => {
			this.destroyPromises.set(shardId, resolve);
			worker.postMessage({ op: WorkerSendPayloadOp.Destroy, shardId, options } satisfies WorkerSendPayload);
		});
	}

	private async setupWorker(workerData: FetchingStrategyOptions & { shardIds: number[] }) {
		const worker = new Worker(this.resolveWorkerPath(), { workerData });
		await once(worker, 'online');
		await this.waitForWorkerReady(worker);
		worker.on('error', err => {
			throw err;
		});
		worker.on('messageerror', err => {
			throw err;
		});
		worker.on('message', async payload => {
			if ('op' in payload) {
				await this.onMessage(worker, payload as WorkerReceivePayload);
			} else {
				await this.options.unknownPayloadHandler?.(payload);
			}
		});
		for (const shardId of workerData.shardIds) {
			this.workerByShardId.set(shardId, worker);
		}
	}

	private resolveWorkerPath() {
		return (
			this.options.workerPath ??
			join(process.cwd(), 'node_modules', '@discordjs', 'ws', 'dist', 'defaultWorker.js')
		);
	}

	private waitForWorkerReady(worker: Worker) {
		return new Promise<void>(resolve => {
			const onMessage = (payload: WorkerReceivePayload) => {
				if (payload.op !== WorkerReceivePayloadOp.WorkerReady) return;
				worker.off('message', onMessage);
				resolve();
			};
			worker.on('message', onMessage);
		});
	}

	private async onMessage(worker: Worker, payload: WorkerReceivePayload) {
		switch (payload.op) {
			case WorkerReceivePayloadOp.Connected:
				this.connectPromises.get(payload.shardId)?.();
				this.connectPromises.delete(payload.shardId);
				break;
			case WorkerReceivePayloadOp.Destroyed:
				this.destroyPromises.get(payload.shardId)?.();
				this.destroyPromises.delete(payload.shardId);
				break;
			case WorkerReceivePayloadOp.Event:
				await (this.manager.emit as any)(payload.event, ...payload.data, payload.shardId);
				break;
			case WorkerReceivePayloadOp.RetrieveSessionInfo: {
				const session = await this.manager.options.retrieveSessionInfo(payload.shardId);
				worker.postMessage({
					op: WorkerSendPayloadOp.SessionInfoResponse,
					nonce: payload.nonce,
					session
				} satisfies WorkerSendPayload);
				break;
			}
			case WorkerReceivePayloadOp.UpdateSessionInfo:
				await this.manager.options.updateSessionInfo(payload.shardId, payload.session);
				break;
			case WorkerReceivePayloadOp.WaitForIdentify: {
				const throttler = await this.ensureThrottler();
				const controller = new AbortController();
				this.waitForIdentifyControllers.set(payload.nonce, controller);
				try {
					await throttler.waitForIdentify(payload.shardId, controller.signal);
					worker.postMessage({
						op: WorkerSendPayloadOp.ShardIdentifyResponse,
						nonce: payload.nonce,
						ok: true
					} satisfies WorkerSendPayload);
				} catch {
					worker.postMessage({
						op: WorkerSendPayloadOp.ShardIdentifyResponse,
						nonce: payload.nonce,
						ok: false
					} satisfies WorkerSendPayload);
				} finally {
					this.waitForIdentifyControllers.delete(payload.nonce);
				}
				break;
			}
			case WorkerReceivePayloadOp.FetchStatusResponse:
				this.fetchStatusPromises.get(payload.nonce)?.(payload.status);
				this.fetchStatusPromises.delete(payload.nonce);
				break;
			case WorkerReceivePayloadOp.WorkerReady:
				break;
			case WorkerReceivePayloadOp.CancelIdentify: {
				this.waitForIdentifyControllers.get(payload.nonce)?.abort();
				this.waitForIdentifyControllers.delete(payload.nonce);
				worker.postMessage({
					op: WorkerSendPayloadOp.ShardIdentifyResponse,
					nonce: payload.nonce,
					ok: false
				} satisfies WorkerSendPayload);
				break;
			}
		}
	}

	private async ensureThrottler() {
		this.throttler ??= await this.manager.options.buildIdentifyThrottler(this.manager);
		return this.throttler;
	}
}
