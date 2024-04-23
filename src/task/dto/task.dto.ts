export class CreateTaskDto{
    taskType: string
    assignTo: number
    description: string
    status: string
    feedBack: string
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
}