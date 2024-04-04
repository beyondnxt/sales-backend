import { IsEmail } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'lead'})
export class Lead{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    companyName: string

    @Column()
    @IsEmail()
    email: string

    @Column()
    phoneNo: string

    @Column()
    description: string

    @Column()
    status: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date
    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date

    @Column()
    updatedBy: number
}