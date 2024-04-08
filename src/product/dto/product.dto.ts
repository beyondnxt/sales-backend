export class CreateProductDto {
    companyId: number
    code: string
    name: string
    model: string
    size: string
    rackNo: string
    brandName: string
    stockAvailable: string
    sellingPrice: string
    createdOn: Date
    createdBy: number
    updatedOn: Date
    updatedBy: number
}