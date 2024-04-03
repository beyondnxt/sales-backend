export class CreateProductDto {
    code: string;
    sku: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdOn: Date;
    createdBy: number
    updatedOn: Date;
    updatedBy: number
}