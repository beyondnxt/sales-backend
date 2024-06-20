export class CreateAttendanceDto{
    id: number
    userId: number
    punchIn: string
    punchOut: string
    punchInLocation: string
    punchOutLocation: string
    punchInDistanceFromOffice: number
    punchOutDistanceFromOffice: number
    status: string
    record: string
    deleted: boolean
    isApproved: string
    isNotify: boolean
    createdOn: Date
    updatedBy: number
    updatedOn: Date
    latitude: string
    longitude: string
}