// import { Product } from "src/product/entity/product.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'company' })
export class Company {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    companyName: string

    @Column({ type: 'simple-json', default: null })
    address: { [key: string]: any }

    @Column({ default: null })
    email: string

    @Column()
    phoneNo: string

    @Column()
    location: string

    @Column({ default: false })
    deleted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ type: 'simple-json', default: null })
    createdBy: { [key: string]: any };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number

    @OneToMany(() => User, user => user.company)
    user: User[];

    // @OneToMany(() => Product, product => product.company)
    // product: Product[];
}