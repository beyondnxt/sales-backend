import { Product } from "src/product/entity/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'company'})
export class Company{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    companyName: string

    @Column({ type: 'simple-json', default: null })
    address: { [key: string]: any }

    @Column({default: null})
    email: string

    @Column()
    phoneNo: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number

    @OneToMany(() => Product, product => product.company)
    product: Product[];
}