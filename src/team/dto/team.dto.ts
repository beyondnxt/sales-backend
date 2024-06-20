export class CreateTeamDto {
    teamName: string
    deleted: boolean
    createdOn: Date
    createdBy: { [key: string]: any }
    updatedOn: Date
    updatedBy: number
}