export class CreateAttendanceDto{
    punchIn: string
    punchOut: string
    punchInDistanceFromOffice: string
    punchOutDistanceFromOffice: string
    createdBy: number
    createdOn: Date
    updatedBy: number
    updatedOn: Date
    latitude: number
    longitude: number
}