import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('metrics')
export class MetricsTable extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public timestamp!: number;

	@Column({ type: 'real', nullable: false })
	public eventLoopDelayMin!: number;

	@Column({ type: 'real', nullable: false })
	public eventLoopDelayMax!: number;

	@Column({ type: 'real', nullable: false })
	public eventLoopDelayMean!: number;

	@Column({ type: 'bigint', nullable: false })
	public memorySizeTotal!: number;

	@Column({ type: 'bigint', nullable: false })
	public memorySizeUsed!: number;

	@Column({ type: 'bigint', nullable: false })
	public memorySizeExternal!: number;

	@Column({ type: 'bigint', nullable: false })
	public memorySizeRSS!: number;

	@Column({ type: 'real', nullable: false })
	public cpuUser!: number;

	@Column({ type: 'real', nullable: false })
	public cpuSystem!: number;

	@Column({ type: 'real', nullable: false })
	public cpuPercent!: number;
}
