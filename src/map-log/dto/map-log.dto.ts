export class CreateMapLogDto {
    userId: number
    location: LocationDto[]
    deleted: boolean
    createdOn: Date
}

export class LocationDto {
    latitude: string
    logtitude: string
    createdOn: Date
}
