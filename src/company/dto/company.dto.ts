export class CreateCompanyDto{
    companyName: string
    address: { [key: string]: any }
    phoneNo: string
    createdOn: Date
    createdBy: number
    updatedOn: Date
    updatedBy: number
}