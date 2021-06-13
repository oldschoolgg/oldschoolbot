import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('minigames')
export class MinigameTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@Index()
	@Column({ name: 'user_id', length: 19, type: 'varchar', nullable: false })
	public userID!: string;

	@Column({ name: 'tithe_farm', type: 'int', nullable: false, default: 0 })
	public TitheFarm!: number;

	@Column({ name: 'wintertodt', type: 'int', nullable: false, default: 0 })
	public Wintertodt!: number;

	@Column({ name: 'sepulchre', type: 'int', nullable: false, default: 0 })
	public Sepulchre!: number;

	@Column({
		name: 'fishing_trawler',
		type: 'int',
		nullable: false,
		default: 0
	})
	public FishingTrawler!: number;

	@Column({ name: 'barb_assault', type: 'int', nullable: false, default: 0 })
	public BarbarianAssault!: number;

	@Column({
		name: 'pyramid_plunder',
		type: 'int',
		nullable: false,
		default: 0
	})
	public PyramidPlunder!: number;

	@Column({ name: 'agility_arena', type: 'int', nullable: false, default: 0 })
	public AgilityArena!: number;

	@Column({
		name: 'champions_challenge',
		type: 'int',
		nullable: false,
		default: 0
	})
	public ChampionsChallenge!: number;

	@Column({
		name: 'mahogany_homes',
		type: 'int',
		nullable: false,
		default: 0
	})
	public MahoganyHomes!: number;

	@Column({ name: 'raids', type: 'int', nullable: false, default: 0 })
	public Raids = 0;

	@Column({
		name: 'gnome_restaurant',
		type: 'int',
		nullable: false,
		default: 0
	})
	public GnomeRestaurant!: number;

	@Column({ name: 'soul_wars', type: 'int', nullable: false, default: 0 })
	public SoulWars!: number;

	@Column({ name: 'rogues_den', type: 'int', nullable: false, default: 0 })
	public RoguesDenMaze!: number;

	@Column({ name: 'gauntlet', type: 'int', nullable: false, default: 0 })
	public Gauntlet!: number;

	@Column({
		name: 'corrupted_gauntlet',
		type: 'int',
		nullable: false,
		default: 0
	})
	public CorruptedGauntlet!: number;

	@Column({ name: 'castle_wars', type: 'int', nullable: false, default: 0 })
	public CastleWars!: number;

	@Column({
		name: 'raids_challenge_mode',
		type: 'int',
		nullable: false,
		default: 0
	})
	public RaidsChallengeMode!: number;

	@Column({
		name: 'magic_training_arena',
		type: 'int',
		nullable: false,
		default: 0
	})
	public MagicTrainingArena!: number;

	@Column({
		name: 'ourania_delivery_service',
		type: 'int',
		nullable: false,
		default: 0
	})
	public OuraniaDeliveryService!: number;

	@Column({
		name: 'big_chompy_bird_hunting',
		type: 'int',
		nullable: false,
		default: 0
	})
	public BigChompyBirdHunting!: number;
}
