import { Customer } from "src/customer/entity/customer.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'task' })
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: null })
    taskType: string

    @Column({ default: null })
    customerId: number

    @ManyToOne(() => Customer, customer => customer.task)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ default: null })
    assignTo: number

    @ManyToOne(() => User, user => user.task)
    @JoinColumn({ name: 'assignTo' })
    user: User;

    @Column({ default: null })
    description: string

    @Column({ default: null })
    status: string

    @Column({ type: 'simple-json', default: null })
    feedBack: { [key: string]: any };

    @Column({ default: null })
    location: string

    @Column({ default: null })
    followUpDate: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ type: 'simple-json' })
    createdBy: { [key: string]: any };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number
}