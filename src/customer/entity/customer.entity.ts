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

    @Column()
    contactPerson: string

    @Column()
    address: string

    @Column()
    pinCode: string

    @Column()
    country: string

    @Column()
    state: string

    @Column()
    city: string

    @Column()
    area: string

    @Column()
    @IsEmail()
    email: string;

    @Column()
    contactNo: string;

    @Column()
    latitude: number

    @Column()
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