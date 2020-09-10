import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AnalyticsTable extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public timestamp!: number;

	@Column({ type: 'bigint' })
	public guildsCount!: number;

	@Column({ type: 'bigint' })
	public membersCount!: number;
}
