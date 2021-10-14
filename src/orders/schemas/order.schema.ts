import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId, Schema as mongooseSchema} from 'mongoose'
import { Address } from 'src/users/schemas/address.schema'
import { OrderItem } from './order-item.schema'

export type OrderDocument = Document & Order

export type OrderStatus = 'pending' | 'processing' | 'deliver' | 'done' | 'returned'

@Schema()
export class Order{
    
    @Prop()
    address: Address

    @Prop({ requied: [true, 'Please add email']})
    email: string

    @Prop({type: mongooseSchema.Types.ObjectId, ref: 'User', requied: [true, 'Please add user id']})
    user: ObjectId

    @Prop({requied: [true, 'Please add order items']})
    items: OrderItem[]

    @Prop({required: [true, 'Please add price value']})
    price: number

    @Prop({default: 'pending', enum: ['pending', 'processing', 'deliver', 'done', 'returned']})
    status: OrderStatus
}

export const OrderSchema = SchemaFactory.createForClass(Order)