import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'boss_event' })
export class BossEventTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@Column('timestamp without time zone', { name: 'start_date', nullable: false })
	public startDate!: Date;

	@Column('integer', { name: 'boss_id', nullable: false })
	public bossID!: number;

	@Index()
	@Column('boolean', { name: 'completed', nullable: false })
	public completed: boolean = false;

	@Column('json', { name: 'data', nullable: false })
	public data!: any;
}
