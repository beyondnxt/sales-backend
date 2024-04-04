import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'product' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number

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
    companyName: string

}