import {
	BaseEntity,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';

import { NewUserTable } from './NewUserTable.entity';

@Entity('slayer_tasks')
export class SlayerTaskTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@ManyToOne(() => NewUserTable, user => user.slayerTasks, { nullable: false })
	@JoinColumn({ name: 'user_id' })
	user!: NewUserTable;

	@CreateDateColumn({ name: 'created_at' })
	public createdAt!: Date;
}
