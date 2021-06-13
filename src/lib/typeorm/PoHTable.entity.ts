import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Check('background_id > 0 AND background_id < 100')
@Entity('poh')
export class PoHTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'user_id' })
	public userID!: string;

	@Column({ type: 'integer', default: 1, name: 'background_id' })
	public backgroundID!: number;

	@Column({ type: 'integer', default: null, nullable: true })
	public altar!: number | null;

	@Column({ type: 'integer', default: null, nullable: true })
	public throne!: number | null;

	@Column({
		type: 'integer',
		name: 'mounted_cape',
		default: null,
		nullable: true
	})
	public mountedCape!: number | null;

	@Column({
		type: 'integer',
		name: 'mounted_fish',
		default: null,
		nullable: true
	})
	public mountedFish!: number | null;

	@Column({
		type: 'integer',
		name: 'mounted_head',
		default: null,
		nullable: true
	})
	public mountedHead!: number | null;

	@Column({
		type: 'integer',
		name: 'mounted_item',
		default: null,
		nullable: true
	})
	public mountedItem!: number | null;

	@Column({
		type: 'integer',
		name: 'jewellery_box',
		default: null,
		nullable: true
	})
	public jewelleryBox!: number | null;

	@Column({
		type: 'integer',
		name: 'prayer_altar',
		default: null,
		nullable: true
	})
	public prayerAltar!: number | null;

	@Column({
		type: 'integer',
		name: 'spellbook_altar',
		default: null,
		nullable: true
	})
	public spellbookAltar!: number | null;

	// Dungeon
	@Column({ type: 'integer', default: null, nullable: true })
	public guard!: number | null;

	@Column({ type: 'integer', default: null, nullable: true })
	public torch!: number | null;

	@Column({
		type: 'integer',
		name: 'dungeon_decoration',
		default: null,
		nullable: true
	})
	public dungeonDecoration!: number | null;

	@Column({ type: 'integer', default: null, nullable: true })
	public prison!: number | null;

	// Garden
	@Column({ type: 'integer', default: null, nullable: true })
	public pool!: number | null;

	@Column({ type: 'integer', default: null, nullable: true })
	public teleport!: number | null;
}
