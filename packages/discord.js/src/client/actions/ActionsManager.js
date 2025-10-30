'use strict';

class ActionsManager {
  // These symbols represent fully built data that we inject at times when calling actions manually.
  // Action#getUser, for example, will return the injected data (which is assumed to be a built structure)
  // instead of trying to make it from provided data
  injectedUser = Symbol('djs.actions.injectedUser');

  injectedChannel = Symbol('djs.actions.injectedChannel');

  injectedMessage = Symbol('djs.actions.injectedMessage');

  constructor(client) {
    this.client = client;

    this.ChannelCreate = this.load(require('./ChannelCreate.js').ChannelCreateAction);
    this.ChannelDelete = this.load(require('./ChannelDelete.js').ChannelDeleteAction);
    this.ChannelUpdate = this.load(require('./ChannelUpdate.js').ChannelUpdateAction);
    this.GuildChannelsPositionUpdate = this.load(
      require('./GuildChannelsPositionUpdate.js').GuildChannelsPositionUpdateAction,
    );
    this.GuildMemberRemove = this.load(require('./GuildMemberRemove.js').GuildMemberRemoveAction);
    this.GuildMemberUpdate = this.load(require('./GuildMemberUpdate.js').GuildMemberUpdateAction);
    this.GuildRoleCreate = this.load(require('./GuildRoleCreate.js').GuildRoleCreateAction);
    this.GuildRoleDelete = this.load(require('./GuildRoleDelete.js').GuildRoleDeleteAction);
    this.GuildRolesPositionUpdate = this.load(require('./GuildRolesPositionUpdate.js').GuildRolesPositionUpdateAction);
    this.GuildUpdate = this.load(require('./GuildUpdate.js').GuildUpdateAction);
    this.InteractionCreate = this.load(require('./InteractionCreate.js').InteractionCreateAction);
    this.MessageCreate = this.load(require('./MessageCreate.js').MessageCreateAction);
    this.MessageDelete = this.load(require('./MessageDelete.js').MessageDeleteAction);
    this.MessageDeleteBulk = this.load(require('./MessageDeleteBulk.js').MessageDeleteBulkAction);
    this.MessagePollVoteAdd = this.load(require('./MessagePollVoteAdd.js').MessagePollVoteAddAction);
    this.MessagePollVoteRemove = this.load(require('./MessagePollVoteRemove.js').MessagePollVoteRemoveAction);
    this.MessageUpdate = this.load(require('./MessageUpdate.js').MessageUpdateAction);
    this.StageInstanceCreate = this.load(require('./StageInstanceCreate.js').StageInstanceCreateAction);
    this.StageInstanceDelete = this.load(require('./StageInstanceDelete.js').StageInstanceDeleteAction);
    this.StageInstanceUpdate = this.load(require('./StageInstanceUpdate.js').StageInstanceUpdateAction);
    this.ThreadCreate = this.load(require('./ThreadCreate.js').ThreadCreateAction);
    this.ThreadMembersUpdate = this.load(require('./ThreadMembersUpdate.js').ThreadMembersUpdateAction);
    this.UserUpdate = this.load(require('./UserUpdate.js').UserUpdateAction);
  }

  load(Action) {
    return new Action(this.client);
  }
}

exports.ActionsManager = ActionsManager;
