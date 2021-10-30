import { Body, Controller, Get, Post, Patch, Delete, Put, Param, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Action, AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/check-policy.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { Category } from './schemas/category.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/auth/public.decorator';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import * as mongoose from 'mongoose'

@UseGuards(AuthenticatedGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService){}

    @Public()
    @Get()
    getCategories(){
        return this.categoriesService.getAll()
    }

    @Public()
    @Get('/:id')
    getCategory(@Param('id') id: mongoose.Types.ObjectId){
        return this.categoriesService.get(id)
    }

    @Public()
    @Get('/:id/products')
    getCategoryProducts(@Param('id') id: mongoose.Types.ObjectId){
        return this.categoriesService.getCategoryProducts(id)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Category))
    @UseGuards(PoliciesGuard)
    @Post()
    addCategory(@Body() dto: CreateCategoryDto){
        return this.categoriesService.create(dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Category))
    @UseGuards(PoliciesGuard)
    @Delete('/:id')
    deleteCategory(@Param('id') id: mongoose.Types.ObjectId){
        return this.categoriesService.delete(id)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @UseGuards(PoliciesGuard)
    @Patch('/:id')
    updateCategory(@Param('id') id: mongoose.Types.ObjectId, @Body() dto: UpdateCategoryDto){
        return this.categoriesService.update(id, dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @UseGuards(PoliciesGuard)
    @Patch('/:id/linkProducts')
    linkProducts(@Param('id') id: mongoose.Types.ObjectId, @Body('products') products: mongoose.Types.ObjectId[]){
        return this.categoriesService.linkProducts(id, products)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @UseGuards(PoliciesGuard)
    @Patch('/:id/unlinkProducts')
    unlinkProducts(@Param('id') id: mongoose.Types.ObjectId, @Body('products') products: mongoose.Types.ObjectId[]){
        return this.categoriesService.unlinkProducts(id, products)
    }
}