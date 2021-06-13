import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('gear_presets')
export class GearPresetsTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'user_id' })
	public userID!: string;

	@PrimaryColumn('varchar', { length: 12, name: 'name', nullable: false })
	public name!: string;

	@Column({
		name: 'two_handed',
		type: 'integer',
		default: null,
		nullable: true
	})
	public TwoHanded: number | null = null;

	@Column({ name: 'body', type: 'integer', default: null, nullable: true })
	public Body: number | null = null;

	@Column({ name: 'cape', type: 'integer', default: null, nullable: true })
	public Cape: number | null = null;

	@Column({ name: 'feet', type: 'integer', default: null, nullable: true })
	public Feet: number | null = null;

	@Column({ name: 'hands', type: 'integer', default: null, nullable: true })
	public Hands: number | null = null;

	@Column({ name: 'head', type: 'integer', default: null, nullable: true })
	public Head: number | null = null;

	@Column({ name: 'legs', type: 'integer', default: null, nullable: true })
	public Legs: number | null = null;

	@Column({ name: 'neck', type: 'integer', default: null, nullable: true })
	public Neck: number | null = null;

	@Column({ name: 'ring', type: 'integer', default: null, nullable: true })
	public Ring: number | null = null;

	@Column({ name: 'shield', type: 'integer', default: null, nullable: true })
	public Shield: number | null = null;

	@Column({ name: 'weapon', type: 'integer', default: null, nullable: true })
	public Weapon: number | null = null;

	@Column({ name: 'ammo', type: 'integer', default: null, nullable: true })
	public Ammo: number | null = null;

	@Column({
		name: 'ammo_qty',
		type: 'integer',
		default: null,
		nullable: true
	})
	public AmmoQuantity: number | null = null;
}
