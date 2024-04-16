export class CreateAttendanceDto{
    punchIn: string
    punchOut: string
    punchInDistanceFromOffice: string
    punchOutDistanceFromOffice: string
    punchInLocation: string
    punchOutLocation: string
    createdBy: number
    createdOn: Date
    updatedBy: number
    updatedOn: Date
}