import { InferSubjects, Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import {User, Category, Order, Look, Product, Role} from './entities'

export type Subjects = InferSubjects<typeof User | typeof Product | typeof Category | typeof Look | typeof Order> | 'all'

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete'


export type AppAbility = Ability<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User){
        const {can, cannot, build} = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>)
        if(['admin', 'editor'].includes(user.role)){
            can('manage', 'all')
        }

        if(user.role === 'editor'){
            cannot('delete', User)
            cannot('update', User, ['role'])
            cannot('delete', Category)
        }
        
        can('read', User, {id: user.id})
        can('update', User, {id: user.id})
        can('delete', User, {id: user.id})
        can('read', Product, {enable: true})
        can('read', Look)
        
        return build({
            detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
        })
    }
    
}
