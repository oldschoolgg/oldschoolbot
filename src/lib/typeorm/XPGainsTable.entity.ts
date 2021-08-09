import { SkillsEnum } from 'oldschooljs/dist/constants';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'xp_gains' })
export class XPGainsTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@Column('varchar', {
		length: 19,
		name: 'user_id',
		nullable: false
	})
	public userID!: string;

	@Index()
	@CreateDateColumn({ nullable: false, type: 'timestamp without time zone' })
	public date!: Date;

	@Index()
	@Column({ type: 'enum', enum: SkillsEnum, name: 'skill', nullable: false })
	public skill!: SkillsEnum;

	@Column({ type: 'integer', name: 'xp', nullable: false })
	public xp!: number;

	@Column({ type: 'boolean', name: 'artificial', nullable: true })
	public artificial!: boolean | null;
}
