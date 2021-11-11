import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document,  PopulatedDoc, Schema as mongooseSchema, Types} from 'mongoose'
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

    @Prop({default: 0})
    totalProducts: number

    @Prop({ type: [{type: mongooseSchema.Types.ObjectId, ref: 'Product'}]})
    products: Product[]

    @Prop({type: mongooseSchema.Types.ObjectId, ref: 'Product'})
    bestseller: Types.ObjectId
}

export const CategorySchema = SchemaFactory.createForClass(Category)