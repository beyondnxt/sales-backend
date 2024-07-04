import { AssetType } from "src/asset-type/entity/asset-type.entity";
import { Customer } from "src/customer/entity/customer.entity";
import { Task } from "src/task/entity/task.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'asset' })
export class Asset {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: null })
    assetTypeId: number

    @ManyToOne(() => AssetType, assetType => assetType.asset)
    @JoinColumn({ name: 'assetTypeId' })
    assetType: AssetType;

    @Column({ default: null })
    customerId: number

    @ManyToOne(() => Customer, customer => customer.asset)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ default: null })
    taskId: number

    @ManyToOne(() => Task, task => task.asset)
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @Column({ default: null })
    dateOfCommissioning: Date

    @Column({ default: null })
    dateOfLastVisit: string

    @Column({ default: null })
    followUpDate: Date

    @Column({ default: false })
    deleted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ default: null })
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column({ default: null })
    updatedBy: number
}