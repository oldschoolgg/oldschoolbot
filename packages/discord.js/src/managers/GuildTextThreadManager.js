'use strict';
const { ThreadManager } = require('./ThreadManager.js');

/**
 * Manages API methods for {@link ThreadChannel} objects and stores their cache.
 *
 * @extends {ThreadManager}
 */
class GuildTextThreadManager extends ThreadManager {
}

exports.GuildTextThreadManager = GuildTextThreadManager;
