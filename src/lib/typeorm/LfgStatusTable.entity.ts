import { ItemBank } from 'oldschooljs/dist/meta/types';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lfg_status')
export class LfgStatusTable extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@Column({ name: 'timesSent', type: 'integer', nullable: false })
	public timesSent!: number;

	@Column({ name: 'qtyKilledDone', type: 'integer', nullable: false })
	public qtyKilledDone!: number;

	@Column({ name: 'usersServed', type: 'integer', nullable: false })
	public usersServed!: number;

	@Column('json', { name: 'lootObtained', nullable: false })
	public lootObtained!: ItemBank;
}
