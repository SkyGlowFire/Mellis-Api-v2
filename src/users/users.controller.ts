import { Controller, Get, Post,  Delete, Param, Body, UseGuards, Patch, Req } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policy.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { UpdateUserDto } from './dto/update_user.dto';
import { Role } from './schemas/user.schema';
import { GetUser } from './user.decorator';
import { UsersService } from './users.service';
import {AppAbility} from '../casl/casl-ability.factory'
import { CreateAddressDto } from './dto/create_address.dto';
import { UpdateAddressDto } from './dto/update_adress.dto';
import {User} from '../casl/entities'
import { ActionType } from 'src/auth/action-type.decorator';
import { OwnerGuard } from './owner.guard';
import { Roles } from 'src/casl/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService){}

    @Roles(Role.Admin, Role.Editor)
    @Get()
    getUsers(){
        return this.usersService.getAll()
    }

    @ActionType('read')
    @UseGuards(OwnerGuard)
    @Get('/details/:id')
    getUser(@Param('id') id: Types.ObjectId){
        return this.usersService.get(id)
    }

    @ActionType('update')
    @UseGuards(OwnerGuard)
    @Patch('/:id')
    updateUser(@Body() dto: UpdateUserDto, @Param('id') id: Types.ObjectId){
        return this.usersService.update(id, dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can('update', User, 'role'))
    @UseGuards(PoliciesGuard)
    @Patch('/:id/role')
    changeUserRole(@Body('role') role: Role, @Param('id') id: Types.ObjectId){
        return this.usersService.changeRole(id, role)
    }

    @ActionType('delete')
    @UseGuards(OwnerGuard)
    @Delete('/:id')
    delete(@Param('id') id: Types.ObjectId){
        return this.usersService.delete(id)
    }

    @ActionType('update')
    @UseGuards(OwnerGuard)
    @Post('/address')
    addAddress(@GetUser('id') userId: Types.ObjectId, @Body() dto: CreateAddressDto){
        return this.usersService.addAddress(userId, dto)
    }

    @Get('/address')
    getAddresses(@GetUser('id') userId: Types.ObjectId){
        return this.usersService.getUserAddresses(userId)
    }

    @ActionType('update')
    @UseGuards(OwnerGuard)
    @Delete('/address/:id')
    deleteAddress(@GetUser('id') userId: Types.ObjectId, @Param('id') id: Types.ObjectId){
        return this.usersService.deleteAddress(id, userId)
    }

    @ActionType('update')
    @UseGuards(OwnerGuard)
    @Patch('/address/:id')
    updateAddress(@Param('id') id: Types.ObjectId, @Body() dto: UpdateAddressDto){
        return this.usersService.updateAddress(id, dto)
    }
}
