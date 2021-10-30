import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatus } from 'aws-sdk/clients/outposts';
import { Model, ObjectId } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private ordersModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
        private readonly usersService: UsersService){}

    async createOrder(dto: CreateOrderDto, user: UserDocument): Promise<OrderDocument>{
        const address = await this.usersService.getAddress(dto.address)
        const {items, ...data} = dto
        const orderItems = await Promise.all(items.map(item => this.orderItemModel.create(item)))
        const order = await this.ordersModel.create({
            ...data, 
            items: orderItems.map(orderItem => orderItem._id),
            address, 
            user: user._id, 
            email: user.email, 
            status: 'pending'
        })
        return order
    }

    async getOrders(): Promise<OrderDocument[]>{
        const orders = await this.ordersModel.find().populate({
            path: 'items',
            populate: {
                path: 'product',
                populate: 'image'
            }
        })
        return orders
    }

    async getUserOrders(user: ObjectId): Promise<OrderDocument[]>{
        const orders = await this.ordersModel.find({user}).populate({
            path: 'items',
            populate: {
                path: 'product',
                populate: 'image'
            }
        })
        return orders
    }

    async updateOrderStatus(id: ObjectId, status: OrderStatus): Promise<OrderDocument>{
        const order = await this.ordersModel.findByIdAndUpdate(id, {'$set': {status}}, {new: true})
        return order
    }
}
