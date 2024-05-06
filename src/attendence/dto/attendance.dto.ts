export class CreateAttendanceDto{
    userId: number
    punchIn: string
    punchOut: string
    punchInLocation: string
    punchOutLocation: string
    punchInDistanceFromOffice: number
    punchOutDistanceFromOffice: number
    status: string
    createdOn: Date
    updatedBy: number
    updatedOn: Date
    latitude: number
    longitude: number
}