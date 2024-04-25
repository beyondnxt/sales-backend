export class CreateTaskDto{
    taskType: string
    customerName: string
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