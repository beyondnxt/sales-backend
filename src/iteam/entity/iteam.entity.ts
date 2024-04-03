import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'iteam' })
export class Iteam {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    Code: string

    @Column()
    Name: string

    @Column()
    Model: string

    @Column()
    Size: string

    @Column()
    RACKNO: string

    @Column()
    Brand_name: string

    @Column()
    Stock_available: string

}