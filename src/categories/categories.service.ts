import { BadRequestException, forwardRef, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { IPath, ProductsService } from 'src/products/products.service';
import { toUrlString } from 'src/utils/textFormatters';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService){}

    async getAll(){
        const categories = await this.categoryModel.find({})
        return categories
    }

    async get(id: ObjectId){
        const category = await this.categoryModel.findById(id)
        return category
    }

    async create(dto: CreateCategoryDto){
        const {parentId, title} = dto
        let parents = [], level = 0, path = []
        if(parentId){
            const parentCategory = await this.categoryModel.findById(parentId).populate('children')
            if(!parentCategory) throw new NotFoundException(`Category with id ${parentId} doesn't exist`)
            const nameSake = parentCategory.children.find(x => {
                if(x instanceof this.categoryModel){return x.title === title}
            })
            if(nameSake) {
                throw new BadRequestException(`Category with name ${title} already exists in category ${parentCategory.title}`)
            }
            parents = [...parentCategory.parents, parentCategory.id]
            path = [...parentCategory.path, title]
            level = parentCategory.level + 1
        }
        const category = await this.categoryModel.create({...dto, parents, level, path})
        if(parentId){
            await this.categoryModel.findByIdAndUpdate(parentId, {"$push": {children: category.id}})
        }
        return category
    }

    async delete(id: ObjectId){
        const category = await this.categoryModel.findById(id)
        if(!category) throw new NotFoundException(`Category not found`)
        const {ids} = await this.parseChildren(id)
        await this.categoryModel.deleteMany({_id: {'$in': ids}})
        return category
    }

     async update(id: ObjectId, dto: UpdateCategoryDto){
        const category = await this.categoryModel.findById(id)
        if(dto.title && category.title !== dto.title){
            const {ids} = await this.parseChildren(id)
            await this.categoryModel.updateMany({_id: {'$in': ids}}, {'$set': {[`path.${category.level}`]: dto.title}})
        }
        return await this.categoryModel.findByIdAndUpdate(id, dto, {new: true})
    }

    async linkProducts(id: ObjectId, productIds: ObjectId[]){
        const products = await this.productsService.getProductsByIds(productIds)
        const options = products.map(x => ({id: x.id, category: x.category}))
        await Promise.all(options.map(x => this.categoryModel.findByIdAndUpdate(x.category, {'$pull': {products: x.id}})))
        await this.productsService.assignToCategory(productIds, id)
        await this.categoryModel.findByIdAndUpdate(id, {'$push': {products: productIds}})
    }

     async unlinkProducts(id: ObjectId, productIds: ObjectId[]){
        await this.productsService.clearCategory(productIds)
        await this.categoryModel.findByIdAndUpdate(id, {'$pull': {products: {'$in': productIds}}})
    }

    async linkProduct(id: ObjectId, productId: ObjectId){
        const product = await this.productsService.get(productId)
        await this.categoryModel.findByIdAndUpdate(product.category, {'$pull': {products: productId}})
        await this.categoryModel.findByIdAndUpdate(id, {'$push': {products: productId}})
    }
    
    async parseChildren(id: ObjectId): Promise<{ids: ObjectId[], products: ObjectId[]}>{
        const products = []
        const ids = []

        const recursive = async (id) => {
            ids.push(id)
            const current = await this.categoryModel.findById(id)
            products.push(...current.products)
            await Promise.all(current.children.map(product => recursive(product)))
        }
        await recursive(id)
        return {products, ids}
    }
    
    async getCategoryIdByPath(path: IPath): Promise<ObjectId>{
        const {categoryName, groupName, subGroupName} = path
        let category = await this.categoryModel.findOne({level: 0, title: toUrlString(categoryName)})
        if(!category) throw new NotFoundException(`Category ${categoryName} does not exist`)
        if(groupName){
            category = await this.categoryModel.findOne({_id: {'$in': category.children}, title: toUrlString(groupName)})
            if(!category) throw new NotFoundException(`Category ${categoryName}/${groupName} does not exist`)
        }
        if(subGroupName){
            category = await this.categoryModel.findOne({_id: {'$in': category.children}, title: toUrlString(subGroupName)})
            if(!category) throw new NotFoundException(`Category ${categoryName}/${groupName}/${subGroupName} does not exist`)
        }
        return category.id
    }
}
