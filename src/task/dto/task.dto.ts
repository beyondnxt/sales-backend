export class CreateTaskDto{
    taskType: string
    companyId: number
    assignTo: number
    description: string
    status: string
    feedBack: string
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
}