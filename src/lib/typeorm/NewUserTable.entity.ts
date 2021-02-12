import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { MinigameTable } from './MinigameTable.entity';

@Entity('new_users')
export class NewUserTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'id' })
	public id!: string;

	@Column({ name: 'username', type: 'varchar', nullable: true, length: 32 })
	public username!: string | null;

	@OneToOne(() => MinigameTable, minigames => minigames.userID)
	@JoinColumn({ name: 'minigame_id' })
	public minigames!: MinigameTable;
}
