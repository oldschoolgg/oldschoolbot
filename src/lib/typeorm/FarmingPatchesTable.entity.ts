import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { TSeedType } from '../skilling/types';

export enum FarmingPatchStatus {
	Planted = 'planted',
	Finished = 'finished',
	Harvested = 'harvested'
}

@Index('userPath', ['userID', 'status'])
@Entity('farmingPatches')
export class FarmingPatchesTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	public id!: number;

	@Column('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Column({ name: 'patch_type', type: 'varchar', nullable: false })
	public patchType!: TSeedType;

	@Column('timestamp without time zone', { name: 'plant_date', nullable: false })
	public plantDate!: Date;

	@Column('timestamp without time zone', { name: 'finish_date', nullable: false })
	public finishDate!: Date;

	@Column('timestamp without time zone', { name: 'harvest_date', nullable: true })
	public harvestDate!: Date;

	@Column({ type: 'enum', enum: FarmingPatchStatus, name: 'status', nullable: false })
	public status!: FarmingPatchStatus;

	@Column('varchar', { name: 'plant', nullable: false })
	public plant!: string;

	@Column('integer', { name: 'quantity', nullable: false })
	public quantity!: number;

	@Column('varchar', { name: 'compost_used', nullable: true })
	public compostUsed!: null | 'compost' | 'supercompost' | 'ultracompost';

	@Column('boolean', { name: 'care_payment' })
	public carePayment!: boolean;
}
