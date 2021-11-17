import {Product} from './product.entity'

export class Category{
    _id: string
    title: string
    text: string
    level: number
    parents: string[]
    children: Category[]
    path: string[]
    products: string[]
    totalProducts: number
    bestseller: Product
}
