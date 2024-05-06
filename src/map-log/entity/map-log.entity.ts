import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'maplog' })
export class MapLog {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @ManyToOne(() => User, user => user.mapLog)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'simple-json', default: null })
    location: { [key: string]: any }

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;
}