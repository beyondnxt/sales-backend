export class CreateCustomerDto{
    name: string
    contactPerson: string
    address: { [key: string]: any }
    pinCode: string
    country: string
    state: string
    city: string
    area: string
    email: string
    contactNo: string
    latitude: number
    longitude: number
    createdOn: Date;
    createdBy: number
    updatedOn: Date;
    updatedBy: number
}