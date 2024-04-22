// import { Company } from "src/company/entity/company.entity";
// import { Order } from "src/order/entity/order.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'product' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number
    
    // @Column({default: null})
    // companyId: number

    // @ManyToOne(() => Company, company => company.product)
    // @JoinColumn({ name: 'companyId' })
    // company: Company;

    @Column({unique: true, default: null})
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
    Sale_rate: string

    @Column({default: null})
    GST_rate: string

    @Column({default: null})
    Brand_name: string

    @Column({default: null})
    Lingam_stock: string

    @Column({default: null})
    Kumari_stock: string

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    // createdOn: Date;

    // @Column()
    // createdBy: number

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    // updatedOn: Date;

    // @Column()
    // updatedBy: number

    // @OneToMany(() => Order, order => order.product)
    // order: Order[];

}