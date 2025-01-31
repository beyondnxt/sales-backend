import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    password: string
    roleId: number
    companyId: number
    status: boolean
    deleted: boolean
  }

  export class userCreated {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}