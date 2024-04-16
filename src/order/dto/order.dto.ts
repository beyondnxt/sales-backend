export class CreateOrderDto{
    customerId: number
    productId: number
    orderDate: Date
    description: string
    qty: number
    rate: number
    discount: number
    taxableValue: number
    taxRate: number
    subTotal: number
    // total: number
    createdOn: Date
    createdBy: number
}