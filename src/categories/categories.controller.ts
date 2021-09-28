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

// @UseGuards(JwtAuthGuard)
@UseGuards(PoliciesGuard)
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
    getCategory(@Param('id') id: ObjectId){
        return this.categoriesService.get(id)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Category))
    @Post()
    addCategory(@Body() dto: CreateCategoryDto){
        return this.categoriesService.create(dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Category))
    @Delete('/:id')
    deleteCategory(@Param('id') id: ObjectId){
        return this.categoriesService.delete(id)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @Patch('/:id')
    updateCategory(@Param('id') id: ObjectId, dto: UpdateCategoryDto){
        return this.categoriesService.update(id, dto)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @Patch('/:id/linkProducts')
    linkProducts(@Param('id') id: ObjectId, @Body('products') products: ObjectId[]){
        return this.categoriesService.linkProducts(id, products)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Category))
    @Patch('/:id/unlinkProducts')
    unlinkProducts(@Param('id') id: ObjectId, @Body('products') products: ObjectId[]){
        return this.categoriesService.unlinkProducts(id, products)
    }
}
