import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId, Schema as mongooseSchema} from 'mongoose'

export type LookDocument = Document & Look

export type Orientation = 'vertical' | 'horizontal'

@Schema()
export class Look{

    @Prop({default: false})
    enable: boolean

    @Prop({required: [true, 'Please add product image'], type: mongooseSchema.Types.ObjectId, ref: 'File'})
    image: ObjectId
    @Prop({type: [{type: mongooseSchema.Types.ObjectId, ref: 'Product'}]})
    items: ObjectId[]

    @Prop({required: [true, 'Please add color'], enum: ['horizontal', 'vertical'], default: 'vertical'})
    orientation: Orientation
}

export const LookSchema = SchemaFactory.createForClass(Look)