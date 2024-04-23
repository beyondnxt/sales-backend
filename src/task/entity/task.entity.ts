import { User } from "src/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'task' })
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    taskType: string

    @Column()
    customerName: string

    @Column({default: null})
    assignTo: number

    @ManyToOne(() => User, user => user.task)
    @JoinColumn({ name: 'assignTo' })
    user: User;

    @Column()
    description: string

    @Column()
    status: string

    @Column()
    feedBack: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column({ type: 'simple-json' })
    createdBy: { [key: string]: any };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number
}