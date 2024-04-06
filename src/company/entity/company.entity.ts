import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'company'})
export class Company{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    companyName: string

    @Column({ type: 'simple-json', default: null })
    address: { [key: string]: any }

    @Column()
    phoneNo: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number
}