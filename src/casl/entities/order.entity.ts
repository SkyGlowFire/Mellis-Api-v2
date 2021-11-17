import { Address } from "./user.entity";

type OrderStatus = 'pending' | 'processing' | 'deliver' | 'done' | 'returned'

export class Order{
    _id: string
    address: Address
    user: string
    email: string
    items: string[]
    price: number
    status: OrderStatus
    createdAt: Date
}