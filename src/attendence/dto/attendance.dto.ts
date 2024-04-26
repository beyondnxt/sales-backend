export class CreateAttendanceDto{
    userId: number
    punchIn: string
    punchOut: string
    punchInLocation: string
    punchOutLocation: string
    punchInDistanceFromOffice: string
    punchOutDistanceFromOffice: string
    status: string
    createdBy: number
    createdOn: Date
    updatedBy: number
    updatedOn: Date
    latitude: number
    longitude: number
}