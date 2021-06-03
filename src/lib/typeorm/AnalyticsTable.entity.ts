import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AnalyticsTable extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public timestamp!: number;

	@Column({ type: 'bigint', nullable: true })
	public guildsCount!: number;

	@Column({ type: 'bigint', nullable: true })
	public membersCount!: number;

	@Column({ type: 'int', nullable: true })
	public clueTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public minigameTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public monsterTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public skillingTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public minionsCount!: number;

	@Column({ type: 'int', nullable: true })
	public ironMinionsCount!: number;

	@Column({ type: 'bigint', nullable: true })
	public totalSacrificed!: number;

	@Column({ type: 'bigint', nullable: true })
	public totalGP!: number;

	@Column({ type: 'bigint', nullable: true })
	public totalXP!: number;

	@Column({ type: 'bigint', nullable: true })
	public dicingBank!: number;

	@Column({ type: 'bigint', nullable: true })
	public duelTaxBank!: number;

	@Column({ type: 'bigint', nullable: true })
	public dailiesAmount!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpSellingItems!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpPvm!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpAlching!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpPickpocket!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpDice!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpOpen!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpDaily!: number;

	@Column({ type: 'bigint', nullable: true })
	public gpItemContracts!: number;
}
