import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AnalyticsTable extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public timestamp!: number;

	@Column({ type: 'bigint' })
	public guildsCount!: number;

	@Column({ type: 'bigint' })
	public membersCount!: number;

	@Column({ type: 'int' })
	public clueTasksCount!: number;

	@Column({ type: 'int' })
	public minigameTasksCount!: number;

	@Column({ type: 'int' })
	public monsterTasksCount!: number;

	@Column({ type: 'int' })
	public skillingTasksCount!: number;
}
