import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pingable_roles' })
export class PingableRolesTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: number;

	@Column('varchar', {
		length: 19,
		nullable: false,
		name: 'role_id',
		unique: true
	})
	public roleID!: string;

	@Column('varchar', { length: 32, nullable: false, name: 'name' })
	public name!: string;
}
