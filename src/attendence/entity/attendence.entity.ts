import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'attendance'})
export class Attendance{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'timestamp' })
    punchIn: Date

    @Column({ type: 'timestamp', default: null })
    punchOut: Date

    @Column({default: null})
    lat: string

    @Column({default: null})
    lng: string

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date

    @Column({default: null})
    updatedBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date

}