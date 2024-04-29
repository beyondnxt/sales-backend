import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({name: 'mapLog'})
export class MapLog{
    @PrimaryColumn()
    id: number

    @Column()
    userId: number

    @ManyToOne(() => User, user => user.mapLog)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    location: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;
}