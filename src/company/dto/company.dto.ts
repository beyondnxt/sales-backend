export class CreateCompanyDto{
    companyName: string
    address: { [key: string]: any }
    email: string
    phoneNo: string
    location: string
    createdOn: Date
    createdBy: number
    updatedOn: Date
    updatedBy: number
    latitude: number
    longitude: number
}