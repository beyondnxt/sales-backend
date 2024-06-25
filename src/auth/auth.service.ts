import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, userCreated } from 'src/user/dto/user.dto';
import * as nodemailer from 'nodemailer';
import { Team } from 'src/team/entity/team.entity';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User)
    private readonly userRepository: Repository<User>, private readonly jwtService: JwtService,
        @InjectRepository(Team)
        private teamRepository: Repository<Team>
    ) { }

    async signUp(signUpDto: CreateUserDto): Promise<any> {
        const { firstName, lastName, phoneNumber, email, password, roleId, companyId, status, deleted } = signUpDto;
        const existingUser = await this.userRepository.findOne({ where: { email, deleted: false } });
        if (existingUser) {
            return { message: 'Email already exists' };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userRepository.create({
            firstName,
            lastName,
            phoneNumber,
            email,
            password: hashedPassword,
            roleId,
            companyId,
            status,
            deleted
        });
        await this.userRepository.save(user);
        const token = this.jwtService.sign({ id: user.id });

        return { token };
    }

    async signIn(signInDto: userCreated): Promise<any> {
        const { email, password } = signInDto;
        const user = await this.userRepository.findOne({ where: { email, deleted: false }, relations: ['role'] });

        if (!user) {
            throw new HttpException({ message: 'Invalid email or password' }, HttpStatus.NOT_FOUND);
        }

        if (user.status !== true) {
            throw new HttpException({ message: 'User is not active' }, HttpStatus.NOT_FOUND);
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new HttpException({ message: 'Invalid email or password' }, HttpStatus.NOT_FOUND);
        }

        const token = this.jwtService.sign({ id: user.id });
        const userData = {
            userId: user.id,
            userName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            roleName: user.role.name,
            token: token
        };

        return { statusCode: HttpStatus.OK, data: userData };
    }

    async getUserInfo(id: number): Promise<any> {
        const user = await this.userRepository.createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.phoneNumber', 'user.email', 'user.roleId', 'user.status'])
            .where('user.id = :id', { id })
            .andWhere('user.deleted = :deleted', { deleted: false })
            .getOne();

        if (!user) {
            throw new NotFoundException(`User id ${id} not found`);
        }
        return user;
    }

    async changePassword(id: number, password: string) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await this.userRepository.update(id, { password: hashedPassword });
            if (!result) {
                throw new NotFoundException('User not found');
            }
            return await this.userRepository.findOne({ where: { id, deleted: false } });
        } catch (error) {
            console.error('Error changing password:', error);
            throw new NotFoundException('Failed to change password');
        }
    }

    async forgotPassword(email: string, newPassword: string): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email, deleted: false } });
        if (!existingUser) {
            throw new NotFoundException('Invalid email');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        existingUser.password = hashedPassword;
        return await this.userRepository.save(existingUser);
    }

    async resetPasswordUsingId(id: number, password: string): Promise<any> {
        try {
            const user = await this.changePassword(id, password);
            return user;
        } catch (error) {
            throw new NotFoundException('Failed to reset password');
        }
    }

    async sendEmailForgotPassword(email: string): Promise<boolean> {
        try {
            const user = await this.userRepository.findOne({ where: { email, deleted: false } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                port: parseInt(process.env.PORT),
                secure: process.env.SECURE === 'true', // Convert string to boolean
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: 'jishajini21@gmail.com',
                to: email,
                subject: 'Forgotten Password',
                text: 'Forgot Password',
                html: `Hi!<br><br>If you requested to reset your password, click <a href="http://localhost:4200/change-password/${user.id}">here</a>`
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new InternalServerErrorException('Failed to send email');
        }
    }
}
