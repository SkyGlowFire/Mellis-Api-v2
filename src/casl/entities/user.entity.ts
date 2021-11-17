export type Role = 'admin' | 'editor' | 'customer'

export class User{
    _id: string
    id: string
    email: string
    username: string
    role: Role
    firstName: string
    lastName: string
    age: number
    phone: string
    thumbnail: string
    addresses: Address[]
}

export class Address{
    _id: string
    firstName: string
    lastName: string
    phone: string
    city: string
    streetName: string
    streetNumber: string
    apartment: string
    zip: number
}