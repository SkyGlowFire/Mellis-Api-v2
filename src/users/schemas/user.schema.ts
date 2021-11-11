import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, Schema as mongooseSchema, ObjectId} from 'mongoose'
import {Address} from './address.schema'

export enum Role {
  Customer = 'customer',
  Editor = 'editor',
  Admin = 'admin'
}

export type UserDocument = Document & User

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User{
    @Prop({
        type: String,
        required: true,
        match: [
          /^[ a-zA-Z0-9А-Яа-я_-]{4,16}$/,
          'Name must be between 4 and 16 characters length, can contain only letters, numbers and "-" or "_" symbols',
        ],
      })
    username: string

    @Prop({
        type: String,
        unique: true,
        required: [true, 'Please add an email'],
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please enter valid email',
        ],
      })
    email: string

    @Prop({default: false, select: false})
    verified: boolean

    @Prop()
    firstName: string

    @Prop()
    lastName: string

    @Prop({select: false})
    password: string

    @Prop({default: false, select: false})
    hasPassword: boolean

    @Prop({default: 'customer'})
    role: Role

    @Prop({unique: true, sparse: true})
    googleId: string

    @Prop({unique: true, sparse: true})
    facebookId: string

    @Prop({unique: true, sparse: true})
    twitterId: string

    @Prop({unique: true, sparse: true})
    instagramId: string

    @Prop()
    age: number

    @Prop()
    thumbnail: string

    @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'Address' }] })
    addresses: Address[]

    @Prop()
    resetPasswordToken: string

    @Prop()
    resetPasswordExpire: number
}

export const UserSchema = SchemaFactory.createForClass<User>(User)

UserSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});