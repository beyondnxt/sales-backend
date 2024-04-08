export class CreateCompanyDto{
    companyName: string
    address: { [key: string]: any }
    email: string
    phoneNo: string
    createdOn: Date
    createdBy: number
    updatedOn: Date
    updatedBy: number
}