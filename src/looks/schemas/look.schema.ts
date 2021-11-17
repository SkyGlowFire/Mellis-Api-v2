import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId, Schema as mongooseSchema} from 'mongoose'
import * as mongoose from 'mongoose'

export type LookDocument = Document & Look

export type Orientation = 'vertical' | 'horizontal'

@Schema()
export class Look{

    @Prop({default: false})
    enable: boolean

    @Prop({required: [true, 'Please add product image'], type: mongooseSchema.Types.ObjectId, ref: 'File'})
    image: mongoose.Types.ObjectId
    @Prop({type: [{type: mongooseSchema.Types.ObjectId, ref: 'Product'}]})
    items: mongoose.Types.ObjectId[]

    @Prop({required: [true, 'Please add color'], enum: ['horizontal', 'vertical'], default: 'vertical'})
    orientation: Orientation
}

export const LookSchema = SchemaFactory.createForClass(Look)