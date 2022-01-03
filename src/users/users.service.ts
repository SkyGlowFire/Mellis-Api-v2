import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {Model, UpdateQuery, Types} from 'mongoose'
import { CreateAddressDto } from './dto/create_address.dto';
import { UpdateAddressDto } from './dto/update_adress.dto';
import { UpdateUserDto } from './dto/update_user.dto';
import { Address, AddressDocument } from './schemas/address.schema';
import {Role, User, UserDocument} from './schemas/user.schema'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        private jwtService: JwtService){}

    async getAll(): Promise<UserDocument[]>{
        const users = await this.userModel.find()
        return users
    }

    async get(id: Types.ObjectId): Promise<UserDocument>{
        const user = await this.userModel.findById(id).populate('addresses')
        return user
    }

    async setRefreshToken(token: string, id: Types.ObjectId){
        const refreshToken = await bcrypt.hash(token, 10)
        await this.userModel.findByIdAndUpdate(id, {refreshToken})
    }

    async removeRefreshToken(id: Types.ObjectId){
        await this.userModel.findByIdAndUpdate(id, {'$unset': {refreshToken: 1}})
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);
    if (isRefreshTokenMatching) return user;
  }

    async getByEmail(email: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({email: email.toLowerCase()}).select('+password')
        return user
    }

    async getByGoogleId(googleId: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({googleId})
        return user
    }

    async getByFacebokId(facebookId: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({facebookId})
        return user
    }

     async getByVkId(vkontakteId: string): Promise<UserDocument>{
        const user = await this.userModel.findOne({vkontakteId})
        return user
    }

    async delete(id: Types.ObjectId): Promise<UserDocument>{
        const user = await this.userModel.findById(id)
        await this.addressModel.deleteMany({_id: {"$in": user.addresses}})
        await user.remove()
        return user
    }

    async update(id: Types.ObjectId, dto: UpdateUserDto): Promise<UserDocument>{
        const updateOptions: UpdateQuery<UserDocument> = {['$set']: {}}
        const {oldPassword, password, ...data} = dto
        if(password){
            const user = await this.userModel.findById(id).select('+password +hasPassword')
            if(user.hasPassword){
                if(!dto.oldPassword) throw new ForbiddenException('Please provide old password')
                const passwMatch = await bcrypt.compare(dto.oldPassword, user.password)
                if(!passwMatch) throw new ForbiddenException('Wrong password')
            } 
            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(password, salt)
            updateOptions['$set'].password = newPassword
        }
        Object.keys(data).forEach((key) => {
            if(data[key] !== ''){
                updateOptions['$set'][key] = data[key]
            }
        })
        const user = await this.userModel.findByIdAndUpdate(id, updateOptions)
        return user
    }

    async changeRole(id: Types.ObjectId, role: Role): Promise<UserDocument>{
        const user = await this.userModel.findByIdAndUpdate(id, {role})
        return user
    }

    async addAddress(userId: Types.ObjectId, dto: CreateAddressDto): Promise<AddressDocument>{
        const address = await this.addressModel.create({...dto, user: userId})
        await this.userModel.findByIdAndUpdate(userId, {"$push": {addresses: address.id}})
        return address
    }

    async updateAddress(id: Types.ObjectId, dto: UpdateAddressDto): Promise<AddressDocument>{
        const address = await this.addressModel.findByIdAndUpdate(id, dto, {new: true})
        return address
    }

    async getAddress(id: Types.ObjectId): Promise<AddressDocument>{
        const address = await this.addressModel.findById(id)
        return address
    }

    async getUserAddresses(user: Types.ObjectId): Promise<AddressDocument[]>{
        const addresses = await this.addressModel.find({user})
        return addresses
    }

    async deleteAddress(id: Types.ObjectId, userId: Types.ObjectId): Promise<Address>{
        const address = await this.addressModel.findByIdAndRemove(id)
        await this.userModel.findByIdAndUpdate(userId, {"$pull": {addresses: {id}}})
        return address
    }


}
