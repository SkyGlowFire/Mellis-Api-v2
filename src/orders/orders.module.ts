import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { CaslModule } from 'src/casl/casl.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [
    UsersModule, 
    CaslModule,
    MongooseModule.forFeature([{
        name: Order.name,
        schema: OrderSchema}])]
})
export class OrdersModule {}
