import type { APIInteraction } from '@oldschoolgg/discord';
import type { IButtonInteraction, IInteraction } from '@oldschoolgg/schemas';
import { TimerManager } from '@sapphire/timer-manager';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';

import type { MInteraction } from '@/lib/discord/interaction/MInteraction.js';
import { apiInteractionParse } from '@/lib/discord/interactionHandler.js';
import type { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';

type InteractionTypeCollected = MInteraction<IButtonInteraction>;

export type CollectorOptions = {
	filter?: (i: InteractionTypeCollected) => boolean | Promise<boolean>;
	maxCollected?: number;
	timeoutMs?: number;
	channelId?: string;
	messageId?: string;
};

type CollectorEvents = {
	collect: [interaction: MInteraction<IButtonInteraction>];
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

	constructor(
		client: OldSchoolBotClient,
		{ filter, maxCollected = 1, timeoutMs, channelId, messageId }: CollectorOptions = {}
	) {
		super();
		this.client = client;
		this.filter = filter;
		this.channelId = channelId;
		this.messageId = messageId;
		this.maxCollected = Math.max(1, maxCollected);
		this.timeoutMs = timeoutMs;
		this.interactionType = 'Button';
		this.boundListener = async (i: APIInteraction) => {
			const mitx = await apiInteractionParse(i);
			void this.onInteraction(mitx);
		};
		this.client.addEventListener('interactionCreate', this.boundListener);
		if (this.timeoutMs && this.timeoutMs > 0) {
			this.timer = TimerManager.setTimeout(() => this.stop('timeout'), this.timeoutMs);
			this.timer.unref?.();
		}
	}

	private async doFilter(interaction: InteractionTypeCollected): Promise<boolean> {
		if (interaction.raw.kind !== this.interactionType) return false;
		if (this.channelId && interaction.channelId !== this.channelId) {
			return false;
		}
		if (this.messageId && interaction.messageId !== this.messageId) {
			return false;
		}
		if (this.filter) {
			const theirFilterResult = await this.filter(interaction);
			return theirFilterResult;
		}
		return true;
	}

	private async onInteraction(interaction: MInteraction) {
		if (this.endedFlag) return;
		try {
			if (!interaction.isButton()) {
				return;
			}
			const filterResult = await this.doFilter(interaction);
			if (!filterResult) return;
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
			this.client.removeEventListener('interactionCreate', this.boundListener);
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
	options?: CollectorOptions
): InteractionCollector {
	return new InteractionCollector(client, options);
}
