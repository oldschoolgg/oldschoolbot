import {
	BaseEntity,
	Check,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';

import { NewUserTable } from './NewUserTable.entity';

@Check('quantity_remaining >= 0')
@Entity('slayer_tasks')
export class SlayerTaskTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@ManyToOne(() => NewUserTable, user => user.slayerTasks, {
		nullable: false
	})
	@JoinColumn({ name: 'user_id' })
	public user!: NewUserTable;

	@CreateDateColumn({ name: 'created_at', nullable: false })
	public createdAt!: Date;

	@Column({ name: 'quantity', type: 'smallint', nullable: false })
	public quantity!: number;

	// The task is considered "finished" when this is 0. Anything more than 0 is incomplete, and only 1 with more than 0 can exist.
	@Column({ name: 'quantity_remaining', type: 'smallint', nullable: false })
	public quantityRemaining!: number;

	@Column({ name: 'slayer_master_id', type: 'smallint', nullable: false })
	public slayerMasterID!: number;

	@Column({ name: 'monster_id', type: 'smallint', nullable: false })
	public monsterID!: number;

	@Column({ name: 'skipped', type: 'boolean', nullable: false })
	public skipped!: boolean;
}
