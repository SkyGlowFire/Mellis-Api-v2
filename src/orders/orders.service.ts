import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatus } from 'aws-sdk/clients/outposts';
import { Model, ObjectId } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
        private readonly usersService: UsersService){}

    async createOrder(dto: CreateOrderDto, user: UserDocument): Promise<OrderDocument>{
        const address = await this.usersService.getAddress(dto.address)
        const order = await this.ordersModel.create({
            ...dto, 
            address, 
            user: user._id, 
            email: user.email, 
            status: 'pending'
        })
        return order
    }

    async getOrders(): Promise<OrderDocument[]>{
        const orders = await this.ordersModel.find()
        return orders
    }

    async getUserOrders(user: ObjectId): Promise<OrderDocument[]>{
        const orders = await this.ordersModel.find({user})
        return orders
    }

    async updateOrderStatus(id: ObjectId, status: OrderStatus): Promise<OrderDocument>{
        const order = await this.ordersModel.findByIdAndUpdate(id, {'$set': {status}}, {new: true})
        return order
    }
}
