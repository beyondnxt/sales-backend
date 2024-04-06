export class CreateOrderDto{
    customerId: number
    productId: number
    date: Date
    subtotal: number
    totalAmount: number
    paymentMethod: string
    cashReceived: number | null
    change: number | null
    status: string
    lat: string
    lng: string
    createdOn: Date
    createdBy: number
}