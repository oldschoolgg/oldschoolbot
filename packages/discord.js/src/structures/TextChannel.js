'use strict';

const { BaseGuildTextChannel } = require('./BaseGuildTextChannel.js');

/**
 * Represents a guild text channel on Discord.
 *
 * @extends {BaseGuildTextChannel}
 */
class TextChannel extends BaseGuildTextChannel {
	_patch(data) {
		super._patch(data);
	}
}

exports.TextChannel = TextChannel;
