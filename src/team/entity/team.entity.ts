import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'team' })
export class Team {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    teamName: string

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
}