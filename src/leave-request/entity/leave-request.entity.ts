import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'leave' })
export class LeaveRequest {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fromDate: Date

    @Column()
    toDate: Date

    @Column()
    description: string

    @Column()
    userId: number

    @ManyToOne(() => User, user => user.leave)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ default: null })
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number
}
