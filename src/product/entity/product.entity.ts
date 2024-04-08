import { Company } from "src/company/entity/company.entity";
import { Order } from "src/order/entity/order.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'product' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({default: null})
    companyId: number

    @ManyToOne(() => Company, company => company.product)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column({default: null})
    code: string

    @Column({default: null})
    name: string

    @Column({default: null})
    model: string

    @Column({default: null})
    size: string

    @Column({default: null})
    rackNo: string

    @Column({default: null})
    brandName: string

    @Column({default: null})
    stockAvailable: string

    @Column({default: null})
    sellingPrice: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number

    @OneToMany(() => Order, order => order.product)
    order: Order[];

}