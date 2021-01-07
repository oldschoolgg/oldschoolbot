import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class WebhookTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'channel_id' })
	public channelID!: string;

	@Column('varchar', { length: 19, name: 'webhook_id' })
	public webhookID!: string;

	@Column('varchar', { length: 100, name: 'webhook_token' })
	public webhookToken!: string;
}
