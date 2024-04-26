export class CreateTaskDto {
    taskType: string
    customerId: number
    assignTo: number
    description: string
    status: string
    feedBack: string
    latitude: number
    longitude: number
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
}