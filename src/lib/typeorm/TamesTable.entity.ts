import { Time } from 'e';
import { BaseEntity, Check, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { tameSpecies } from '../tames';
import { ItemBank } from '../types';
import { TameActivityTable } from './TameActivityTable.entity';

export enum TameGrowthStage {
	Baby = 'baby',
	Juvenile = 'juvenile',
	Adult = 'adult'
}

@Check('growth_percent >= 0')
@Check('growth_percent <= 100')
@Check('max_combat_level >= 1 AND max_combat_level <= 100')
@Check('max_artisan_level >= 1 AND max_artisan_level <= 100')
@Check('max_gatherer_level >= 1 AND max_gatherer_level <= 100')
@Check('max_support_level >= 1 AND max_support_level <= 100')
@Entity({ name: 'tames' })
export class TamesTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: number;

	@Column('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Index()
	@CreateDateColumn({ nullable: false, type: 'timestamp without time zone' })
	public date!: Date;

	@Column('varchar', { length: 64, name: 'nickname', nullable: true })
	public nickname!: string | null;

	@Column('integer', { name: 'species_id', nullable: false })
	public speciesID!: number;

	@Column({ type: 'enum', enum: TameGrowthStage, name: 'growth_stage', enumName: 'tame_growth' })
	public growthStage!: TameGrowthStage;

	@Column('integer', { name: 'growth_percent', nullable: false })
	public currentGrowthPercent!: number;

	@Column('integer', { name: 'max_combat_level', nullable: false })
	public maxCombatLevel!: number;

	@Column('integer', { name: 'max_artisan_level', nullable: false })
	public maxArtisanLevel!: number;

	@Column('integer', { name: 'max_gatherer_level', nullable: false })
	public maxGathererLevel!: number;

	@Column('integer', { name: 'max_support_level', nullable: false })
	public maxSupportLevel!: number;

	@Column('json', { name: 'max_total_loot', nullable: false })
	public totalLoot!: ItemBank;

	@OneToMany(() => TameActivityTable, task => task.tame, { nullable: false })
	activities!: TameActivityTable[];

	async addDuration(duration: number): Promise<string | null> {
		if (this.growthStage === TameGrowthStage.Adult) return null;
		const percentToAdd = Math.floor(duration / Time.Minute / 20);
		let newPercent = Math.floor(Math.max(1, Math.min(100, this.currentGrowthPercent + percentToAdd)));

		if (newPercent === 100) {
			newPercent = 0;
			this.growthStage =
				this.growthStage === TameGrowthStage.Baby ? TameGrowthStage.Juvenile : TameGrowthStage.Adult;
			this.currentGrowthPercent = newPercent;
			await this.save();
			return `Your tame has grown into a ${this.growthStage}!`;
		}
		this.currentGrowthPercent = newPercent;
		await this.save();
		return `Your tame has grown ${percentToAdd}%!`;
	}

	get growthLevel() {
		const growth =
			3 - [TameGrowthStage.Baby, TameGrowthStage.Juvenile, TameGrowthStage.Adult].indexOf(this.growthStage);
		return growth;
	}

	get combatLvl() {
		return Math.floor(this.maxCombatLevel / this.growthLevel + 1);
	}

	get gathererLvl() {
		return Math.floor(this.maxGathererLevel / this.growthLevel + 1);
	}

	get supportLvl() {
		return Math.floor(this.maxSupportLevel / this.growthLevel + 1);
	}

	get artisanLvl() {
		return Math.floor(this.maxArtisanLevel / this.growthLevel + 1);
	}

	get species() {
		return tameSpecies.find(s => s.id === this.speciesID)!;
	}

	get name() {
		return `${this.nickname ?? this.species.name}`;
	}

	toString() {
		let str = `${this.name} (`;
		str += [
			[this.combatLvl, '<:combat:802136963956080650>'],
			[this.artisanLvl, '<:artisan:802136963611885569>'],
			[this.gathererLvl, '<:gathering:802136963913613372>']
		]
			.map(([emoji, lvl]) => `${emoji}${lvl}`)
			.join(' ');
		str += ')';
		return str;
	}
}
