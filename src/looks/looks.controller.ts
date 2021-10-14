import { Controller, Get, Param, Patch, Query, Body, Post, UseInterceptors, UploadedFiles, Delete, Put, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/auth/public.decorator';
import { Action, AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/check-policy.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { Roles } from 'src/casl/roles.decorator';
import { Role } from 'src/users/schemas/user.schema';
import { CreateLookDto } from './dto/create-look.dto';
import { UpdateLookDto } from './dto/update-look.dto';
import { LooksService } from './looks.service';
import { Look } from '../casl/casl-ability.factory';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@UseGuards(AuthenticatedGuard)
@Controller('looks')
export class LooksController {
    constructor(private readonly looksService: LooksService){}

    @Public()
    @Get()
    getLooks(){
        return this.looksService.getLooks()
    }

    @Roles(Role.Admin, Role.Editor)
    @Get('/all')
    getAllLooks(){
        return this.looksService.getAllLooks()
    }

    @Public()
    @Get('/:id')
    getLook(@Param('id') id: ObjectId){
        return this.looksService.getLook(id)
    }

    @Roles(Role.Admin, Role.Editor)
    @Get('/all/:id')
    getAnyLook(@Param('id') id: ObjectId){
        return this.looksService.getAnyLook(id)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Look))
    @Patch('/enable')
    enableLooks(@Body('looks') looks: ObjectId[]){
        return this.looksService.enableLooks(looks)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Look))
    @Patch('/disable')
    disableLooks(@Body('looks') looks: ObjectId[]){
        return this.looksService.disableLooks(looks)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Look))
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1}
    ]))
    @Post()
    createLook(@Body() dto: CreateLookDto, @UploadedFiles() files: {image: Express.Multer.File[]}){
        const {image} = files
        return this.looksService.createLook(dto, image[0])
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Look))
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1}
    ]))
    @Put('/:id')
    updateLook(@Param('id') id: ObjectId, @Body() dto: UpdateLookDto, @UploadedFiles() files: {image: Express.Multer.File[]}){
        const {image} = files
        return this.looksService.updateLook(id, dto, image?.[0])
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Look))
    @Delete('/:id')
    dleteLook(@Param('id') id: ObjectId){
        return this.looksService.delete(id)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Look))
    @Patch('/delete-many')
    deleteLooks(@Body('looks') ids: ObjectId[]){
        return this.looksService.deleteMany(ids)
    }

}
