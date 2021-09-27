import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId, PopulatedDoc, Schema as mongooseSchema} from 'mongoose'
import { Product } from 'src/products/schemas/product.schema'

export type CategoryDocument = Document & Category

@Schema({
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Category{
    @Prop({ 
        required: [true, 'Please add link name'],
        minLength: 2,
        maxLength: 60})
    title: string

    @Prop({ maxLength: 500})
    text: string

    @Prop({ default: 0})
    level: number

    @Prop({ type: [{type: mongooseSchema.Types.ObjectId, ref: 'Category'}]})
    parents: [PopulatedDoc<Category>]

    @Prop({ type: [{type: mongooseSchema.Types.ObjectId, ref: 'Category'}]})
    children: [PopulatedDoc<Category>]

    @Prop()
    path: string[]

    @Prop({ type: [{type: mongooseSchema.Types.ObjectId, ref: 'Product'}]})
    products: Product[]
}

export const CategorySchema = SchemaFactory.createForClass(Category)