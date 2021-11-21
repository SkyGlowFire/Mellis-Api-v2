import { Controller, Get, Post, Patch, UseGuards, Param, Body } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/casl/roles.decorator';
import { Role, UserDocument } from 'src/users/schemas/user.schema';
import {OrderStatus} from './schemas/order.schema'
import { GetUser } from 'src/users/user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
     constructor(private readonly ordersService: OrdersService){}

    @Roles(Role.Admin, Role.Editor)
    @Get()
    getOrders(){
        return this.ordersService.getOrders()
    }

    @Get('/my')
    getMyOrders(@GetUser('id') id: ObjectId){
        return this.ordersService.getUserOrders(id)
    }

    @Roles(Role.Admin, Role.Editor)
    @Get('/details/:id')
    getUserOrders(@Param('id') id: ObjectId){
        return this.ordersService.getUserOrders(id)
    }

    @Roles(Role.Admin, Role.Editor)
    @Patch('/:id/status')
    updateOrderStatus(@Param('id') id: ObjectId, @Body('status') status: OrderStatus){
        return this.ordersService.updateOrderStatus(id, status)
    }

    @Post()
    createOrder(@Body() dto: CreateOrderDto, @GetUser() user: UserDocument){
        return this.ordersService.createOrder(dto, user)
    }
}
