import type { IInteraction } from '@oldschoolgg/schemas';
import { TimerManager } from '@sapphire/timer-manager';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import type { APIInteraction } from 'discord-api-types/v10';

import type { DiscordClient } from '../client/DiscordClient.js';
import { apiInteractionParse } from './apiInteractionParse.js';
import type { ButtonMInteraction, MInteraction } from './MInteraction.js';

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
	private client: DiscordClient;
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

	constructor({ filter, maxCollected = 1, timeoutMs, channelId, messageId, users, interaction }: CollectorOptions) {
		super();
		this.interaction = interaction;
		this.client = interaction.client;
		this.filter = filter;
		this.channelId = channelId;
		this.messageId = messageId;
		this.maxCollected = Math.max(1, maxCollected);
		this.timeoutMs = timeoutMs;
		this.interactionType = 'Button';
		this.users = users;
		this.boundListener = async (i: APIInteraction) => {
			const mitx = await apiInteractionParse(this.client, i);
			if (!mitx?.isButton()) return;
			try {
				await this.onInteraction(mitx);
			} catch (err) {
				console.error(`Error in InteractionCollector boundListener: ${err}`);
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
		if (
			!itx.rawInteraction.message?.interaction_metadata?.id ||
			itx.rawInteraction.message.interaction_metadata.id !== this.interaction.id
		) {
			return false;
		}
		if (itx.raw.kind !== this.interactionType) {
			return false;
		}
		if (this.channelId && itx.channelId !== this.channelId) {
			return false;
		}
		if (this.messageId && itx.messageId !== this.messageId) {
			return false;
		}
		if (this.users && !this.users.includes(itx.userId)) {
			return `This button is not for you.`;
		}
		if (this.filter) {
			const theirFilterResult = await this.filter(itx);
			return theirFilterResult;
		}
		return true;
	}

	private async onInteraction(interaction: MInteraction) {
		if (this.endedFlag) {
			return;
		}
		try {
			if (!interaction.isButton()) {
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

export function createInteractionCollector(options: CollectorOptions): InteractionCollector {
	return new InteractionCollector(options);
}

export function collectSingleInteraction(
	options: Omit<CollectorOptions, 'maxCollected'>
): Promise<ButtonMInteraction | null> {
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector({ ...options, maxCollected: 1 });
		collector.on('collect', i => {
			collector.stop('collectedSingle');
			resolve(i);
		});
		collector.on('end', (_collected, reason) => {
			if (reason !== 'collectedSingle') {
				resolve(null);
			}
		});
		collector.on('error', err => {
			console.error(`Error in collectSingleInteraction: ${err}`);
			reject(err);
		});
	});
}
