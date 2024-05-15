export class CreateTaskDto {
    taskType: string
    customerId: number
    assignTo: number
    description: string
    status: string
    feedBack: { [key: string]: any };
    location: string
    followUpDate: Date
    latitude: number
    longitude: number
    deleted: boolean
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
}