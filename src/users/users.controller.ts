import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policy.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CreateUserDto } from './dto/create_user.dto';
import { UpdateUserDto } from './dto/update_user.dto';
import { Role } from './schemas/user.schema';
import { GetUser } from './user.decorator';
import { UsersService } from './users.service';
import {AppAbility, Action} from '../casl/casl-ability.factory'
import { CreateAddressDto } from './dto/create_address.dto';
import { UpdateAddressDto } from './dto/update_adress.dto';
import { Public } from 'src/auth/public.decorator';
import {User} from '../casl/casl-ability.factory'
import { ActionType } from 'src/auth/action-type.decorator';
import { OwnerGuard } from './owner.guard';
import { Roles } from 'src/casl/roles.decorator';

@UseGuards(JwtAuthGuard)
@UseGuards(PoliciesGuard)
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService){}

    @Roles(Role.Admin, Role.Editor)
    @Get()
    getUsers(){
        return this.usersService.getAll()
    }

    @ActionType(Action.Read)
    @UseGuards(OwnerGuard)
    @Get('/:id')
    getUser(@Param('id') id: ObjectId){
        return this.usersService.get(id)
    }

    @Public()
    @Post()
    createUser(@Body() dto: CreateUserDto){
        return this.usersService.create(dto)
    }

    @ActionType(Action.Update)
    @UseGuards(OwnerGuard)
    @Patch('/:id')
    updateUser(@Body() dto: UpdateUserDto, @Param('id') id: ObjectId){
        return this.usersService.update(id, dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User, 'role'))
    @Patch('/:id/role')
    changeUserRole(@Body() role: Role, @Param('id') id: ObjectId){
        return this.usersService.changeRole(id, role)
    }

    @ActionType(Action.Delete)
    @UseGuards(OwnerGuard)
    @Delete('/:id')
    delete(@Param('id') id: ObjectId){
        return this.usersService.delete(id)
    }

    @ActionType(Action.Update)
    @UseGuards(OwnerGuard)
    @Post('/address')
    addAddress(@GetUser('id') userId: ObjectId, dto: CreateAddressDto){
        return this.usersService.addAddress(userId, dto)
    }

    @ActionType(Action.Update)
    @UseGuards(OwnerGuard)
    @Delete('/address/:id')
    deleteAddress(@GetUser('id') userId: ObjectId, @Param('id') id: ObjectId){
        return this.usersService.deleteAddress(id, userId)
    }

    @ActionType(Action.Update)
    @UseGuards(OwnerGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User, 'addresses'))
    @Patch('/address/:id')
    updateAddress(@Param('id') id: ObjectId, @Body() dto: UpdateAddressDto){
        return this.usersService.updateAddress(id, dto)
    }
}
