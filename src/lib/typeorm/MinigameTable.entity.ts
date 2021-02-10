import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('minigames')
export class MinigameTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'user_id' })
	public userID!: string;

	@Column({ name: 'tithe_farm', type: 'int', nullable: false, default: 0 })
	public TitheFarm!: number;

	@Column({ name: 'wintertodt', type: 'int', nullable: false, default: 0 })
	public Wintertodt!: number;

	@Column({ name: 'sepulchre', type: 'int', nullable: false, default: 0 })
	public Sepulchre!: number;

	@Column({ name: 'fishing_trawler', type: 'int', nullable: false, default: 0 })
	public FishingTrawler!: number;

	@Column({ name: 'barb_assault', type: 'int', nullable: false, default: 0 })
	public BarbarianAssault!: number;

	@Column({ name: 'pyramid_plunder', type: 'int', nullable: false, default: 0 })
	public PyramidPlunder!: number;

	@Column({ name: 'agility_arena', type: 'int', nullable: false, default: 0 })
	public AgilityArena!: number;

	@Column({ name: 'champions_challenge', type: 'int', nullable: false, default: 0 })
	public ChampionsChallenge!: number;

	@Column({ name: 'mahogany_homes', type: 'int', nullable: false, default: 0 })
	public MahoganyHomes!: number;

	@Column({ name: 'gnome_restaurant', type: 'int', nullable: false, default: 0 })
	public GnomeRestaurant!: number;
}
