import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationDto } from "../dto/map-log.dto";

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
    location: LocationDto[]

    @Column({ default: false })
    deleted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;
}