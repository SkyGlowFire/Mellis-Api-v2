import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, Schema as mongooseSchema, Types} from 'mongoose'
import { User } from './user.schema'

export type AddressDocument = Document & Address

@Schema()
export class Address{
    @Prop({required: true})
    firstName: string

    @Prop({required: true})
    lastName: string

    @Prop()
    phone: number

    @Prop({required: true})
    city: string

    @Prop({required: true})
    streetName: string

    @Prop({required: true})
    streetNumber: number

    @Prop()
    apartment: number

    @Prop({required: true})
    zip: number

    @Prop({type: mongooseSchema.Types.ObjectId, ref: 'User'})
    user: Types.ObjectId
}

export const AddressSchema = SchemaFactory.createForClass(Address)