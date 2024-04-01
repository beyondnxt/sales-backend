import { Customer } from "src/customer/entity/customer.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'feedback'})
export class Feedback{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    feedback: string

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    customerId: number

    @ManyToOne(() => Customer, customer => customer.feedback)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

}