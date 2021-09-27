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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IFilters, IPath, ProductsService } from './products.service';
import { Product } from '../casl/casl-ability.factory';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService){}

    @Public()
    @Get('/category/:categoryName?/:groupName?/:subGroupName?')
    getProductsByCategory(@Param() path: IPath, @Query() filters: IFilters){
        return this.productsService.getByCategory(path, filters)
    }

    @Roles(Role.Admin, Role.Editor)
    @Get('/all')
    getAllProducts(){
        return this.productsService.getAll()
    }

    @Public()
    @Get('/:id')
    getProduct(@Param('id') id: ObjectId){
        return this.productsService.get(id)
    }

    @Roles(Role.Admin, Role.Editor)
    @Get('/all/:id')
    getAny(@Param('id') id: ObjectId){
        return this.productsService.getAny(id)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    @Patch('/enable')
    enableProducs(@Body('products') products: ObjectId[]){
        return this.productsService.enableProducts(products)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    @Patch('/disable')
    dsableProducs(@Body('products') products: ObjectId[]){
        return this.productsService.disableProducts(products)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Product))
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1},
        {name: 'media', maxCount: 8}
    ]))
    @Post()
    createProduct(@Body() dto: CreateProductDto, @UploadedFiles() files: {image: Express.Multer.File[], media: Express.Multer.File[]}){
        const {image, media} = files
        return this.productsService.createProduct(dto, image[0], media)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1},
        {name: 'media', maxCount: 8}
    ]))
    @Put('/:id')
    updateProduct(@Param('id') id: ObjectId, @Body() dto: UpdateProductDto, @UploadedFiles() files: {image: Express.Multer.File[], media: Express.Multer.File[]}){
        const {image, media} = files
        return this.productsService.update(id, dto, image[0], media)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Product))
    @Delete('/:id')
    deleteProduct(@Param('id') id: ObjectId){
        return this.productsService.delete(id)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Product))
    @Patch('/delete-many')
    deleteProducts(@Body('products') ids: ObjectId[]){
        return this.productsService.deleteMany(ids)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    @Patch('/:id/add-related-products')
    addRelatedProducts(@Param('id') id: ObjectId, @Body('products') products: ObjectId[]){
        return this.productsService.addRelatedProducts(id, products)
    }

    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    @Patch('/:id/remove-related-products')
    removeRelatedProducts(@Param('id') id: ObjectId, @Body('products') products: ObjectId[]){
        return this.productsService.removeRelatedProducts(id, products)
    }
}
