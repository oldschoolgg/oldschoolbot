import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommandsTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id!: number;

	@Column('varchar', { length: 19, name: 'user_id' })
	@Index()
	public userID!: string;

	// If in DM, its the user ID
	@Column('varchar', { length: 19, name: 'channel_id' })
	public channelID!: string;

	@Column('varchar', { length: 19, name: 'guild_id', nullable: true })
	public guildID!: string;

	@Column({ name: 'timestamp', type: 'timestamp without time zone' })
	public time!: Date;

	@Column('jsonb', { name: 'args', default: () => "'[]'::JSONB" })
	public args: any[] = [];

	@Column('varchar', { length: 20, name: 'command_name' })
	public commandName!: string;
}
