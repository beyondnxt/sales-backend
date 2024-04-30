import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'attendance' })
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @ManyToOne(() => User, user => user.attendance)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: null })
    punchIn: string

    @Column({ default: null })
    punchOut: string

    @Column({ default: null })
    punchInLocation: string

    @Column({ default: null })
    punchOutLocation: string

    @Column({ default: null })
    punchInDistanceFromOffice: string

    @Column({ default: null })
    punchOutDistanceFromOffice: string

    @Column()
    status: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date

    @Column({ default: null })
    updatedBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date

}