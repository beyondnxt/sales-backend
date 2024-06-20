export class CreateCompanyDto {
    companyName: string
    location: string
    openingTime: string
    closingTime: string
    actions: string
    deleted: boolean
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
    latitude: number
    longitude: number
}