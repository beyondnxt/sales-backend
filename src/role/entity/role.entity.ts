import { User } from 'src/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';


@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'simple-json', default: null }) // Assuming menuAccess is stored as JSON
  menuAccess: { [key: string]: any };

  @Column({ default: false })
  deleted: boolean

  @OneToMany(() => User, user => user.role)
  user: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Column({ default: null })
  createdBy: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedOn: Date;

  @Column({ default: null })
  updatedBy: number
}
