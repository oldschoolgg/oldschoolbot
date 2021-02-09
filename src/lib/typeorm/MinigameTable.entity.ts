import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('minigames')
export class MinigameTable extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, name: 'user_id' })
	public userID!: string;

	@Column({ name: 'tithe_farm', type: 'int', nullable: false, default: 0 })
	public TitheFarm = 0;

	@Column({ name: 'wintertodt', type: 'int', nullable: false, default: 0 })
	public Wintertodt = 0;

	@Column({ name: 'sepulchre', type: 'int', nullable: false, default: 0 })
	public Sepulchre = 0;

	@Column({ name: 'fishing_trawler', type: 'int', nullable: false, default: 0 })
	public FishingTrawler = 0;

	@Column({ name: 'barb_assault', type: 'int', nullable: false, default: 0 })
	public BarbarianAssault = 0;

	@Column({ name: 'pyramid_plunder', type: 'int', nullable: false, default: 0 })
	public PyramidPlunder = 0;

	@Column({ name: 'agility_arena', type: 'int', nullable: false, default: 0 })
	public AgilityArena = 0;

	@Column({ name: 'champions_challenge', type: 'int', nullable: false, default: 0 })
	public ChampionsChallenge = 0;

	@Column({ name: 'mahogany_homes', type: 'int', nullable: false, default: 0 })
	public MahoganyHomes = 0;

	@Column({ name: 'gnome_restaurant', type: 'int', nullable: false, default: 0 })
	public GnomeRestaurant = 0;
}
