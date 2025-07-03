import type { BaseMessageOptions, InteractionReplyOptions } from 'discord.js';

import type { CommandResponse } from '../util';

export function normalizeMahojiResponse(one: Awaited<CommandResponse>): BaseMessageOptions {
	if (!one) return {};
	if (typeof one === 'string') return { content: one };
	const response: BaseMessageOptions = {};
	if (one.content) response.content = one.content;
	if (one.files) response.files = one.files;
	if (one.components) response.components = one.components;
	return response;
}

export function roughMergeMahojiResponse(
	one: Awaited<CommandResponse>,
	two: Awaited<CommandResponse>
): InteractionReplyOptions {
	const first = normalizeMahojiResponse(one);
	const second = normalizeMahojiResponse(two);
	const newContent: string[] = [];

	const newResponse: InteractionReplyOptions = { content: '', files: [], components: [] };
	for (const res of [first, second]) {
		if (res.content) newContent.push(res.content);
		if (res.files) newResponse.files = [...newResponse.files!, ...res.files];
		if (res.components) newResponse.components = res.components;
	}
	newResponse.content = newContent.join('\n\n');

	return newResponse;
}
