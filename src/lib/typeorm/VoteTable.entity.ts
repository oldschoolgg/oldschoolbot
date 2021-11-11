import { calcWhatPercent } from 'e';
import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { cleanMentions, Util } from '../util';

@Entity({ name: 'vote' })
export class VoteTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@PrimaryColumn('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Column('timestamp without time zone', { name: 'created_at', nullable: false })
	public createdAt!: Date;

	@Column('varchar', { name: 'yes_voters', length: 19, array: true })
	public yesVoters!: string[];

	@Column('varchar', { name: 'no_voters', length: 19, array: true })
	public noVoters!: string[];

	@Column('varchar', { length: 1200, name: 'text', nullable: false, unique: true })
	public text!: string;

	title() {
		return `\`${this.id}. ${Util.escapeMarkdown(cleanMentions(null, this.text).slice(0, 32))} [${
			this.yesVoters.length === 0
				? 'No votes'
				: `${calcWhatPercent(this.yesVoters.length, this.yesVoters.length + this.noVoters.length).toFixed(
						2
				  )}% ${this.yesVoters.length} Yes ${this.noVoters.length} No`
		}]\``;
	}
}
