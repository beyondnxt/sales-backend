import { IsEmail, IsNotEmpty } from 'class-validator';
import { Attendance } from 'src/attendence/entity/attendence.entity';
import { Company } from 'src/company/entity/company.entity';
import { LeaveRequest } from 'src/leave-request/entity/leave-request.entity';
import { Role } from 'src/role/entity/role.entity';
import { Task } from 'src/task/entity/task.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'user' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    firstName: string;

    @Column()
    @IsNotEmpty()
    lastName: string;

    @Column()
    @IsNotEmpty()
    phoneNumber: string;

    @Column()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column({ name: 'roleId' })
    roleId: number

    @ManyToOne(() => Role, role => role.user)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @Column({ name: 'companyId'})
    companyId: number

    @ManyToOne(() => Company, company => company.user)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    status: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;

    @Column()
    createdBy: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedOn: Date;

    @Column()
    updatedBy: number

    @OneToMany(() => LeaveRequest, leave => leave.user)
    leave: LeaveRequest[];

    @OneToMany(() => Attendance, attendance => attendance.user)
    attendance: Attendance[];

    @OneToMany(() => Task, task => task.user)
    task: Task[];

}