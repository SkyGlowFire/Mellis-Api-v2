import { BadRequestException, forwardRef, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import { IPath, ProductsService } from 'src/products/products.service';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { capitalize, toUrlString } from 'src/utils/textFormatters';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import * as mongoose from 'mongoose'

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService){}

    async getAll(){
        let data = await this.categoryModel.find({level:0})
        .populate([
        {path: 'products', select: 'id'},
        {path: "children",
            populate: [
                {path:'products', select: 'id'}, 
                {path: "children", populate: [{path: 'products', select: 'id'}]}
            ]
        }])
        return data
    }

    async get(id: mongoose.Types.ObjectId){
        const category = await this.categoryModel.findById(id).populate('products')
        return category
    }

    async getCategoryProducts(id: mongoose.Types.ObjectId): Promise<ProductDocument[]>{
        const category = await this.categoryModel.findById(id)
        const products = await this.productModel.find({_id: {'$in': category.products}})
        return products
    }

    async create(dto: CreateCategoryDto){
        const {parentId, title} = dto
        let parents = [], level = 0, path = [title]
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

    async delete(id: mongoose.Types.ObjectId){
        const category = await this.categoryModel.findById(id)
        if(!category) throw new NotFoundException(`Category not found`)
        const parent = category.parents.pop()
        await this.categoryModel.findByIdAndUpdate(parent, {'$pull': {children: id}})
        const {ids, products} = await this.parseChildren(id)
        await this.categoryModel.deleteMany({_id: {'$in': ids}})
        await this.productsService.clearCategory(products)
        return category
    }

     async update(id: mongoose.Types.ObjectId, dto: UpdateCategoryDto){
        const category = await this.categoryModel.findById(id)
        if(!category) throw new NotFoundException(`Category not found`)
        if(dto.title && category.title !== dto.title){
            const {ids} = await this.parseChildren(id)
            await this.categoryModel.updateMany({_id: {'$in': ids}}, {'$set': {[`path.${category.level}`]: dto.title}})
            const path = [...category.path]
            path[category.level] = dto.title
            const pathString = path.map(x => capitalize(x)).join('/')
            await this.productModel.updateMany({category: id}, {'$set': {[`path.${category.level}`]: dto.title, pathString}})
        }
        return await this.categoryModel.findByIdAndUpdate(id, dto, {new: true})
    }

    async linkProducts(id: mongoose.Types.ObjectId, productIds: mongoose.Types.ObjectId[]){
        const category = await this.categoryModel.findById(id)
        const totalProducts = productIds.length
        const productsToUnlink = await this.productModel.find({_id: {'$in': productIds}, category: {'$exists': true}})
        const unlinkOptions = productsToUnlink.map(x => ({product: x.id, category: x.category}))
        await Promise.all(unlinkOptions.map(x => this.unlinkProduct(x.category, x.product)))
        await this.productsService.assignToCategory(productIds, category)
        await this.categoryModel.findByIdAndUpdate(id, {'$push': {products: productIds}})
        await this.updateTotalProducts(id, totalProducts, 'inc')
        return {success: true}
    }

     async unlinkProducts(id: mongoose.Types.ObjectId, productIds: mongoose.Types.ObjectId[]){
        const totalProducts = productIds.length
        await this.productsService.clearCategory(productIds)
        await this.categoryModel.findByIdAndUpdate(id, {'$pull': {products: {'$in': productIds}}})
        await this.updateTotalProducts(id, totalProducts, 'dec')
        return {success: true}
    }

    async linkProduct(id: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId){
        await this.categoryModel.findByIdAndUpdate(id, {'$push': {products: productId}})
        await this.updateTotalProducts(id, 1, 'inc')
    }

    async unlinkProduct(id: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId){
        await this.categoryModel.findByIdAndUpdate(id, {'$pull': {products: productId}})
        await this.updateTotalProducts(id, 1, 'dec')
    }

    private async updateTotalProducts(categoryId: mongoose.Types.ObjectId, totalProducts: number, action: 'inc' | 'dec'){
        const total = action === 'dec' ? -totalProducts : totalProducts
        const category = await this.categoryModel.findByIdAndUpdate(categoryId, {'$inc': {totalProducts: total}})
        const {parents} = category
        if(parents.length > 0){
            await this.categoryModel.updateMany({_id: {'$in': parents}}, {'$inc': {totalProducts: total}})
        } 
    }
    
    async parseChildren(id: mongoose.Types.ObjectId): Promise<{ids: mongoose.Types.ObjectId[], products: mongoose.Types.ObjectId[]}>{
        let products = []
        const ids = []

        const recursive = async (id) => {
            ids.push(id)
            const current = await this.categoryModel.findById(id)
            products = products.concat(current.products)
            await Promise.all(current.children.map(product => recursive(product)))
        }
        await recursive(id)
        return {products, ids}
    }
    
    async getCategoryIdByPath(path: IPath): Promise<mongoose.Types.ObjectId>{
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
