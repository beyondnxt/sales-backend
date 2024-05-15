export class CreateRoleDto {
    name: string;
    description: string;
    menuAccess: { [key: string]: any };
    deleted: boolean
}