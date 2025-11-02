// export interface InteractionCollectorOptions extends CollectorOptions {
//   channel?: any;
//   componentType?: number | null;
//   guild?: any;
//   interactionType?: number | null;
//   max?: number;
//   maxComponents?: number;
//   maxUsers?: number;
//   message?: any;
// }

// export class InteractionCollector extends Collector {
//   public messageId: string | null;
//   public channelId: string | null;
//   public guildId: string | null;
//   public interactionType: number | null;
//   public componentType: number | null;
//   public users: Collection<string, any>;
//   public total: number;

//   private _handleMessageDeletion?: (message: any) => void;
//   private _handleChannelDeletion?: (channel: any) => void;
//   private _handleThreadDeletion?: (thread: any) => void;
//   private _handleGuildDeletion?: (guild: any) => void;

//   constructor(client: any, options: InteractionCollectorOptions = {}) {
//     super(client, options);
//     this.messageId = options.message?.id ?? null;
//     this.channelId =
//       options.message?.channelId ??
//       options.message?.channel_id ??
//       this.client.channels.resolveId?.(options.channel) ??
//       null;
//     this.guildId =
//       options.message?.guildId ??
//       options.message?.guild_id ??
//       this.client.guilds.resolveId?.(options.channel?.guild) ??
//       this.client.guilds.resolveId?.(options.guild) ??
//       null;
//     this.interactionType = options.interactionType ?? null;
//     this.componentType = options.componentType ?? null;
//     this.users = new Collection();
//     this.total = 0;

//     this.client.incrementMaxListeners?.();

//     if (this.messageId) {
//       this._handleMessageDeletion = this._handleMessageDeletionImpl.bind(this);
//       this.client.on(Events.MessageDelete, this._handleMessageDeletion);
//     }

//     if (this.channelId) {
//       this._handleChannelDeletion = this._handleChannelDeletionImpl.bind(this);
//       this._handleThreadDeletion = this._handleThreadDeletionImpl.bind(this);
//       this.client.on(Events.ChannelDelete, this._handleChannelDeletion);
//       this.client.on(Events.ThreadDelete, this._handleThreadDeletion);
//     }

//     if (this.guildId) {
//       this._handleGuildDeletion = this._handleGuildDeletionImpl.bind(this);
//       this.client.on(Events.GuildDelete, this._handleGuildDeletion);
//     }

//     this.client.on(Events.InteractionCreate, this.handleCollect);

//     this.once('end', () => {
//       this.client.removeListener(Events.InteractionCreate, this.handleCollect);
//       if (this._handleMessageDeletion) this.client.removeListener(Events.MessageDelete, this._handleMessageDeletion);
//       if (this._handleChannelDeletion) this.client.removeListener(Events.ChannelDelete, this._handleChannelDeletion);
//       if (this._handleThreadDeletion) this.client.removeListener(Events.ThreadDelete, this._handleThreadDeletion);
//       if (this._handleGuildDeletion) this.client.removeListener(Events.GuildDelete, this._handleGuildDeletion);
//       this.client.decrementMaxListeners?.();
//     });

//     this.on('collect', (interaction: any) => {
//       this.total++;
//       if (interaction.user) this.users.set(interaction.user.id, interaction.user);
//     });
//   }

//   protected collect(interaction: any): string | null {
//     if (this.interactionType && interaction.type !== this.interactionType) return null;
//     if (this.componentType && interaction.componentType !== this.componentType) return null;
//     if (this.messageId && interaction.message?.id !== this.messageId) return null;
//     if (this.channelId && interaction.channelId !== this.channelId) return null;
//     if (this.guildId && interaction.guildId !== this.guildId) return null;
//     return interaction.id ?? null;
//   }

//   protected dispose(interaction: any): string | null {
//     if (this.interactionType && interaction.type !== this.interactionType) return null;
//     if (this.componentType && interaction.componentType !== this.componentType) return null;
//     if (this.messageId && interaction.message?.id !== this.messageId) return null;
//     if (this.channelId && interaction.channelId !== this.channelId) return null;
//     if (this.guildId && interaction.guildId !== this.guildId) return null;
//     return interaction.id ?? null;
//   }

//   empty() {
//     this.total = 0;
//     this.collected.clear();
//     this.users.clear();
//     this.checkEnd();
//   }

//   get endReason(): string | null {
//     if ((this.options as InteractionCollectorOptions).max && this.total >= (this.options as InteractionCollectorOptions).max) return 'limit';
//     if (
//       (this.options as InteractionCollectorOptions).maxComponents &&
//       this.collected.size >= (this.options as InteractionCollectorOptions).maxComponents!
//     )
//       return 'componentLimit';
//     if (
//       (this.options as InteractionCollectorOptions).maxUsers &&
//       this.users.size >= (this.options as InteractionCollectorOptions).maxUsers!
//     )
//       return 'userLimit';
//     return super.endReason;
//   }

//   private _handleMessageDeletionImpl(message: any) {
//     if (message.id === this.messageId) this.stop('messageDelete');
//   }

//   private _handleChannelDeletionImpl(channel: any) {
//     if (channel.id === this.channelId || channel.threads?.cache.has(this.channelId)) this.stop('channelDelete');
//   }

//   private _handleThreadDeletionImpl(thread: any) {
//     if (thread.id === this.channelId) this.stop('threadDelete');
//   }

//   private _handleGuildDeletionImpl(guild: any) {
//     if (guild.id === this.guildId) this.stop('guildDelete');
//   }
// }
