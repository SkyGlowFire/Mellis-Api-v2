type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
type Color = "black" | "blue" | "brown" | "green" | "grey" | "orange" | "red" | "white" | "yellow"

export class Product{
    _id: string
    title: string
    enable: boolean
    description: string
    category: string
    image: string
    media: string[]
    sizes: Size[]
    color: Color
    brand: string
    weight: number
    path: string[]
    pathString: string
    sku: string
    relatedProducts: string[]
    price: number
    comparePrice: number
    bulkDiscountEnable: boolean
    bulkDiscountQty: number
    bulkDiscountPrice: number
}