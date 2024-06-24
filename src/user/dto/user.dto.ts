import { IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  roleId: number
  companyId: number
  @IsInt({ each: true })
  teamId: number[];
  status: boolean
  deleted: boolean
  createdOn: Date
  createdBy: number
  updatedOn: Date
  updatedBy: number
}

export class userCreated {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}