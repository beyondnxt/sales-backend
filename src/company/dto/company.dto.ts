export class CreateCompanyDto{
    companyName: string
    address: { [key: string]: any }
    email: string
    phoneNo: string
    location: string
    deleted: boolean
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
    latitude: number
    longitude: number
}