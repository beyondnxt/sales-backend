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
    orderDate: Date

    @Column()
    description: string

    @Column()
    qty: number

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    rate: number
    
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discount: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    taxableValue: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    taxRate: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subTotal: number

    // @Column({ type: 'decimal', precision: 10, scale: 2 })
    // total: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number
    
}