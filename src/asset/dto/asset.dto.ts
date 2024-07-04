export class CreateAssetDto {
    assetTypeId: number
    customerId: number
    taskId: number
    dateOfCommissioning: Date
    dateOfLastVisit: string
    followUpDate: Date
    deleted: boolean
    createdOn: Date
    createdBy: number
    updatedOn: Date
    updatedBy: number
}