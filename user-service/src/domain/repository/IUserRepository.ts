import {User} from "@/domain/entity/user"

export interface IUserRepository {
    create(data:Omit<User,'id' | 'createdAt' | 'updatedAt'>):Promise<User>;
    findByID(id:string):Promise<User | null>;
    findByEmail(email:string):Promise<User | null>;
    updateSsoId(id:string, ssoId:string):Promise<User>;
}