import { IsEmail } from "class-validator";
import { Order } from "src/order/entity/order.entity";
import { Task } from "src/task/entity/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'customer' })
export class Customer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: null })
    contactPerson: string

    @Column({ default: null })
    address: string

    @Column({ default: null })
    pinCode: string

    @Column({ default: null })
    country: string

    @Column({ default: null })
    state: string

    @Column({ default: null })
    city: string

    @Column({ default: null })
    area: string

    @Column({ default: null })
    @IsEmail()
    email: string;

    @Column({ default: null })
    contactNo: string;

    @Column({ default: null })
    latitude: number

    @Column({ default: null })
    longitude: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ default: null })
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number

    @OneToMany(() => Order, order => order.customer)
    order: Order[];

    @OneToMany(() => Task, task => task.customer)
    task: Task[];
}