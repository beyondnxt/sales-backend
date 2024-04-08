import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'expense'})
export class Expense{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    stayExpense: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    foodExpense: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    travelExpense: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalExpense: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number
}