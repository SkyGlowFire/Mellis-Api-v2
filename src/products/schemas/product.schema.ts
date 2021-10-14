import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, Schema as mongooseSchema} from 'mongoose'
import * as mongoose from 'mongoose'
import * as crypto from 'crypto'

export type ProductDocument = Document & Product

export type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'


@Schema()
export class Product{

    @Prop()
    title: string

    @Prop()
    brand: string

    @Prop({default: false})
    enable: boolean

    @Prop({maxlength: 1000})
    description: string

    @Prop({type: mongooseSchema.Types.ObjectId, ref: 'Category'})
    category: mongoose.Types.ObjectId

    @Prop({})
    path: string[]

    @Prop({})
    pathString: string

    @Prop({required: [true, 'Please add product image'], type: mongooseSchema.Types.ObjectId, ref: 'File'})
    image: mongoose.Types.ObjectId

    @Prop({type: [{type: mongooseSchema.Types.ObjectId, ref: 'File'}]})
    media: mongoose.Types.ObjectId[]

    @Prop({type: [{enum: ['xs', 's', 'm', 'l', 'xl', 'xxl'], type: String}], default: ['xs', 's', 'm', 'l', 'xl', 'xxl'] })
    sizes: Size[]

    @Prop({required: [true, 'Please add color']})
    color: string

    @Prop({required: [true, 'Please add product weight']})
    weight: number

    @Prop({default: crypto.randomBytes(6).toString('hex')})
    sku: string

    @Prop({type: [{type: mongooseSchema.Types.ObjectId, ref: 'Product'}]})
    relatedProducts: Product[] | mongoose.Types.ObjectId[]

    @Prop({required: [true, 'Please add product price']})
    price: number

    @Prop()
    comparePrice: number

    @Prop({default: false})
    bulkDiscountEnable: boolean

    @Prop({default: 2})
    bulkDiscountQty: number

    @Prop({default: 0})
    bulkDiscountPrice: number
}

export const ProductSchema = SchemaFactory.createForClass(Product)