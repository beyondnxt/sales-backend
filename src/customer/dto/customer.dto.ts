export class CreateCustomerDto{
    name: string
    address: { [key: string]: any }
    phoneNumber: string;
    email: string;
    createdOn: Date;
    createdBy: number
    updatedOn: Date;
    updatedBy: number
}