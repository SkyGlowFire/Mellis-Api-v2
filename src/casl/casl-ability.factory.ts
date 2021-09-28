import { InferSubjects, Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Category } from "src/categories/schemas/category.schema";
import { UserDocument, Role } from "src/users/schemas/user.schema";

export type Subjects = InferSubjects<typeof User | typeof Product | typeof Category> | 'all'

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export class User{
    constructor(public _id: string){}
}

export class Look{
    constructor(public _id: string){}
}

export class Product{
    enable: boolean = true
    constructor(opt?: {enable?:boolean}){
        if(opt.enable) this.enable = opt.enable
    }
}

export type CaslSubject = User | Product

export type AppAbility = Ability<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: UserDocument){
        const {can, cannot, build} = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>)
        if([Role.Admin, Role.Editor].includes(user.role)){
            can(Action.Manage, 'all')
        }

        if(user.role === Role.Editor){
            cannot(Action.Delete, User)
            cannot(Action.Update, User, ['role'])
            cannot(Action.Delete, Category)
        }
        
        can(Action.Read, User, {_id: user.id})
        can(Action.Update, User, {_id: user.id})
        can(Action.Delete, User, {_id: user.id})
        can(Action.Read, Product, {enable: true})
        can(Action.Read, Look)
        
        return build({
            detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
        })
    }
    
}
