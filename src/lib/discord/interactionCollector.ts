import type { APIInteraction } from '@oldschoolgg/discord';
import type { IInteraction } from '@oldschoolgg/schemas';
import { TimerManager } from '@sapphire/timer-manager';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import type { ButtonMInteraction, MInteraction } from '@/lib/discord/interaction/MInteraction.js';
import { apiInteractionParse } from '@/lib/discord/interactionHandler.js';
import type { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';

type InteractionTypeCollected = ButtonMInteraction;

export type CollectorOptions = {
	filter?: (i: InteractionTypeCollected) => boolean | Promise<boolean>;
	maxCollected?: number;
	timeoutMs?: number;
	channelId?: string;
	messageId?: string;
	interaction: MInteraction;
	users?: string[];
};

type CollectorEvents = {
	collect: [interaction: ButtonMInteraction];
	end: [collected: Map<string, InteractionTypeCollected>, reason: string];
	error: [err: unknown];
};

export class InteractionCollector extends AsyncEventEmitter<CollectorEvents> {
	private client: OldSchoolBotClient;
	private filter?: (i: InteractionTypeCollected) => boolean | Promise<boolean>;
	private maxCollected: number;
	private timeoutMs?: number;
	private collected = new Map<string, InteractionTypeCollected>();
	private endedFlag = false;
	private timer?: NodeJS.Timeout;
	private boundListener: (i: APIInteraction) => Promise<void>;
	private channelId?: string;
	private messageId?: string;
	private interactionType: IInteraction['kind'] = 'Button';
	public users?: string[];
	private interaction: MInteraction;

	constructor(
		client: OldSchoolBotClient,
		{ filter, maxCollected = 1, timeoutMs, channelId, messageId, users, interaction }: CollectorOptions
	) {
		super();
		this.interaction = interaction;
		this.client = client;
		this.filter = filter;
		this.channelId = channelId;
		this.messageId = messageId;
		this.maxCollected = Math.max(1, maxCollected);
		this.timeoutMs = timeoutMs;
		this.interactionType = 'Button';
		this.users = users;
		this.boundListener = async (i: APIInteraction) => {
			// Logging.logDebug('Interaction received in boundListener of InteractionCollector');
			const mitx = await apiInteractionParse(i);
			if (!mitx?.isButton()) return;
			try {
				await this.onInteraction(mitx);
			} catch (err) {
				mitx.logError(`Error in InteractionCollector boundListener: ${err}`);
				this.emit('error', err);
				this.stop('error');
			}
		};
		this.client.addListener('interactionCreate', this.boundListener);
		if (this.timeoutMs && this.timeoutMs > 0) {
			this.timer = TimerManager.setTimeout(() => this.stop('timeout'), this.timeoutMs);
			this.timer.unref?.();
		}
	}

	private async doFilter(itx: InteractionTypeCollected): Promise<boolean | string> {
		if (itx.rawInteraction.message!.interaction_metadata!.id !== this.interaction.id) {
			Logging.logDebug(
				`ITX MID MISMATCH: ${itx.userId} clicking button from message ${itx.rawInteraction.message!.interaction_metadata!.id} but collector is for message ${this.interaction.id}`
			);
			return false;
		}
		if (itx.raw.kind !== this.interactionType) {
			Logging.logDebug(`${itx.userId} Interaction kind mismatch`);
			return false;
		}
		if (this.channelId && itx.channelId !== this.channelId) {
			Logging.logDebug(`${itx.userId} Channel ID mismatch`);
			return false;
		}
		if (this.messageId && itx.messageId !== this.messageId) {
			Logging.logDebug(`${itx.userId} Message ID mismatch`);
			return false;
		}
		if (this.users && !this.users.includes(itx.userId)) {
			Logging.logDebug(`${itx.userId} not a valid user (not in ${this.users.join(', ')})`);
			return `This button is not for you.`;
		}
		if (this.filter) {
			const theirFilterResult = await this.filter(itx);
			Logging.logDebug('Filter result');
			return theirFilterResult;
		}
		return true;
	}

	private async onInteraction(interaction: MInteraction) {
		// Logging.logDebug(`Interaction received in collector onInteraction, kind: ${interaction.kind}`);
		if (this.endedFlag) {
			Logging.logDebug('Collector already ended');
			return;
		}
		try {
			if (!interaction.isButton()) {
				Logging.logDebug('Interaction is not button');
				return;
			}
			const filterResult = await this.doFilter(interaction);
			if (filterResult && typeof filterResult === 'string') {
				return interaction.reply({
					ephemeral: true,
					content: filterResult
				});
			}
			if (!filterResult) {
				Logging.logDebug(`${interaction.userId} returned false`);
				return;
			}
			if (!interaction.id || this.collected.has(interaction.id)) return;
			this.collected.set(interaction.id, interaction);
			this.emit('collect', interaction);
			if (this.collected.size >= this.maxCollected) this.stop('maxCollected');
		} catch (err) {
			this.emit('error', err);
			this.stop('error');
		}
	}

	stop(reason = 'user') {
		if (this.endedFlag) return;
		this.endedFlag = true;
		try {
			this.client.removeListener('interactionCreate', this.boundListener);
		} finally {
			if (this.timer) {
				TimerManager.clearTimeout(this.timer);
				this.timer = undefined;
			}
			this.emit('end', this.collected, reason);
		}
	}

	ended() {
		return this.endedFlag;
	}

	size() {
		return this.collected.size;
	}
}

export function createInteractionCollector(
	client: OldSchoolBotClient,
	options: CollectorOptions
): InteractionCollector {
	return new InteractionCollector(client, options);
}

export function collectSingleInteraction(
	client: OldSchoolBotClient,
	options: Omit<CollectorOptions, 'maxCollected'>
): Promise<ButtonMInteraction | null> {
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, { ...options, maxCollected: 1 });
		collector.on('collect', i => {
			collector.stop('collectedSingle');
			resolve(i);
		});
		collector.on('end', (_collected, reason) => {
			Logging.logDebug(`collectSingleInteraction ended with reason: ${reason}`);
			if (reason !== 'collectedSingle') {
				resolve(null);
			}
		});
		collector.on('error', err => {
			Logging.logError(`Error in collectSingleInteraction: ${err}`);
			reject(err);
		});
	});
}
