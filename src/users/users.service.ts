import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model, ObjectId} from 'mongoose'
import { CreateAddressDto } from './dto/create_address.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { UpdateAddressDto } from './dto/update_adress.dto';
import { UpdateUserDto } from './dto/update_user.dto';
import { Address, AddressDocument } from './schemas/address.schema';
import {Role, User, UserDocument} from './schemas/user.schema'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>){}

    async getAll(): Promise<UserDocument[]>{
        const users = await this.userModel.find()
        return users
    }

    async get(id: ObjectId): Promise<UserDocument>{
        const user = await this.userModel.findById(id).populate('addresses')
        return user
    }

    async getByEmail(email: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({email}).select('+password')
        return user
    }

     async getByGoogleId(googleId: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({googleId})
        return user
    }

    async create(dto: CreateUserDto): Promise<UserDocument>{
        const user = await this.userModel.create(dto)
        return user
    }

    async delete(id: ObjectId): Promise<UserDocument>{
        const user = await this.userModel.findById(id)
        await this.addressModel.deleteMany({_id: {"$in": user.addresses}})
        await user.remove()
        return user
    }

    async update(id: ObjectId, dto: UpdateUserDto): Promise<UserDocument>{
        const user = await this.userModel.findByIdAndUpdate(id, dto)
        return user
    }

    async changeRole(id: ObjectId, role: Role): Promise<UserDocument>{
        const user = await this.userModel.findByIdAndUpdate(id, {role})
        return user
    }

    async addAddress(userId: ObjectId, dto: CreateAddressDto): Promise<Address>{
        const address = await this.addressModel.create({...dto, user: userId})
        await this.userModel.findByIdAndUpdate(userId, {"$push": {addresses: address.id}})
        return address
    }

    async updateAddress(id: ObjectId, dto: UpdateAddressDto): Promise<Address>{
        const address = await this.addressModel.findByIdAndUpdate(id, dto)
        return address
    }

     async getAddress(id: ObjectId): Promise<Address>{
        const address = await this.addressModel.findById(id)
        return address
    }

    async deleteAddress(id: ObjectId, userId: ObjectId): Promise<Address>{
        const address = await this.addressModel.findByIdAndRemove(id)
        await this.userModel.findByIdAndUpdate(userId, {"$pull": {addresses: {id}}})
        return address
    }
}
