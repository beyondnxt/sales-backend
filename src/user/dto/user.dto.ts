import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    roleId: number;
    status: boolean;
  }

  export class userCreated {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}