import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId, Schema as mongooseSchema} from 'mongoose'

export type OrderItemDocument = Document & OrderItem

@Schema()
export class OrderItem{
    @Prop({required: [true, 'Please add product name']})
    title: string

    @Prop({required: [true, 'Please add size']})
    size: string

    @Prop({required: [true, 'Please add color']})
    color: string

    @Prop({required: [true, 'Please add price value']})
    price: number

    @Prop({required: [true, 'Please add qty value']})
    qty: number

    @Prop({required: [true, 'Please add image'], type: mongooseSchema.Types.ObjectId, ref: 'File'})
    image: ObjectId
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem)