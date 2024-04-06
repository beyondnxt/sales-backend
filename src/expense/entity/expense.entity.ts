import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'expense'})
export class Expense{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    stayExpense: string

    @Column()
    foodExpense: string

    @Column()
    travelExpense: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number
}