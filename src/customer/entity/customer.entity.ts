import { IsEmail } from "class-validator";
import { Feedback } from "src/feedback/entity/feedback.entity";
import { Order } from "src/order/entity/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'customer' })
export class Customer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ type: 'simple-json', default: null })
    address: { [key: string]: any }

    @Column()
    phoneNumber: string;

    @Column()
    @IsEmail()
    email: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number

    @OneToMany(() => Feedback, feedback => feedback.customer)
    feedback: Feedback[];

    @OneToMany(() => Order, order => order.customer)
    order: Order[];
}