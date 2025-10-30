'use strict';

const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { MessagePayload } = require('../structures/MessagePayload.js');
const { ThreadManager } = require('./ThreadManager.js');

/**
 * Manages API methods for threads in forum channels and stores their cache.
 *
 * @extends {ThreadManager}
 */
class GuildForumThreadManager extends ThreadManager {

  async create({
    name,
    autoArchiveDuration = this.channel.defaultAutoArchiveDuration,
    message,
    reason,
    rateLimitPerUser,
    appliedTags,
  } = {}) {
    if (!message) {
      throw new DiscordjsTypeError(ErrorCodes.GuildForumMessageRequired);
    }

    const { body, files } = await (message instanceof MessagePayload ? message : MessagePayload.create(this, message))
      .resolveBody()
      .resolveFiles();

    const data = await this.client.rest.post(Routes.threads(this.channel.id), {
      body: {
        name,
        auto_archive_duration: autoArchiveDuration,
        rate_limit_per_user: rateLimitPerUser,
        applied_tags: appliedTags,
        message: body,
      },
      files,
      reason,
    });

    return this.client.actions.ThreadCreate.handle(data).thread;
  }
}

exports.GuildForumThreadManager = GuildForumThreadManager;
