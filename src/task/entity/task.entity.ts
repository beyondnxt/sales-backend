import { Customer } from "src/customer/entity/customer.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'task' })
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
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

    @Column()
    description: string

    @Column()
    status: string

    @Column({ type: 'simple-json' })
    feedBack: { [key: string]: any };

    @Column()
    location: string

    @Column({ default: null})
    followUpDate: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ type: 'simple-json' })
    createdBy: { [key: string]: any };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number
}