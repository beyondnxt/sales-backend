import { Customer } from "src/customer/entity/customer.entity";
import { Product } from "src/product/entity/product.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'order'})
export class Order{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    customerId: number

    @ManyToOne(() => Customer, customer => customer.order)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column()
    productId: number

    @ManyToOne(() => Product, product => product.order)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    date: Date

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({default: null})
    paymentMethod: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cashReceived: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    change: number | null;

    @Column({default: null})
    status: string

    @Column({default: null})
    lat: string

    @Column({default: null})
    lng: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number
    
}