import { Role } from "src/domain/user/enums/role.enum";
import { Status } from "src/domain/user/enums/status.enum";

export interface IUserRepository {
    uuid?: string;
    firebase_uid?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    image?: string;
    gender?: string;
    dob?: Date;
    role?: Role;
    status?: Status;
    provider_id?: string;
    is_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}