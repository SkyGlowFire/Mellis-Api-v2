import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery, } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { Category, CategoryDocument } from 'src/categories/schemas/category.schema';
import { FilesService } from 'src/files/files.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument, Size } from './schemas/product.schema';
import * as mongoose from 'mongoose'
import { capitalize, fromUrlString, toUrlString } from 'src/utils/textFormatters';
import { OrderItem, OrderItemDocument } from 'src/orders/schemas/order-item.schema';

export interface IFilters{
    sizes?: string
    colors?: string
    price?: string
    sort?: string
    sale?: string
    search?: string
}

export interface IPath{
    categoryName: string
    groupName?: string
    subGroupName?: string
}

export interface IProductsResponse{
    products: ProductDocument[]
    count: number
    minPrice?: number
    maxPrice?: number
    category: CategoryDocument
}

export interface ISearchResponse {
    products: ProductDocument[]
    total: number
    minPrice?: number
    maxPrice?: number
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
        @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService,
        private filesService: FilesService 
        ){}

    async createProduct(dto: CreateProductDto, image: Express.Multer.File, media: Express.Multer.File[]){
        const category = await this.categoriesService.get(dto.category)
        if(!category) {throw new NotFoundException('Category not found')}

        const imageId = await this.filesService.uploadFile(image)
        let mediaIds = []
        if(media){
            mediaIds = await Promise.all(media.map(file => this.filesService.uploadFile(file)))
        }
        const pathString = category.path.map(x => capitalize(x)).join('/')
        const product = await this.productModel.create({...dto, image: imageId, media: mediaIds, path: category.path, pathString})
        await this.categoriesService.linkProduct(category._id, product._id)
        return product
    }

    async get(id: mongoose.Types.ObjectId): Promise<ProductDocument>{
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        const product = await this.productModel.findOne({_id: id, enable: true}).populate(['category', 'image', 'media'])
        if(!product){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        return product
    }

    async getAny(id: mongoose.Types.ObjectId): Promise<ProductDocument>{
        return await this.productModel.findById(id).populate(['category', 'image', 'media'])
    }

    async getRelatedProducts(id: mongoose.Types.ObjectId): Promise<ProductDocument[]>{
        const product = await this.productModel.findById(id)
        const relatedProducts = await this.productModel.find({_id: {'$in': product.relatedProducts}})
        .populate('image')
        return relatedProducts
    }

    async getAll(filter?: string): Promise<ProductDocument[]>{
        let options = {}
        if(filter){
            options = {'$or': [
                {title: {'$regex': /filter/, '$options': 'i'}},
                {sku: {'$regex': /filter/, '$options': 'i'}},
                {id: {'$regex': /filter/, '$options': 'i'}}
            ]}
        }
        return await this.productModel.find(options).populate(['image'])
    }

    async getByCategory(path: IPath, filters: IFilters): Promise<IProductsResponse>{
        const category = await this.categoriesService.getCategoryByPath(path)
        console.log('category', category)
        let queryOptions: FilterQuery<ProductDocument> = {enable: true}
        queryOptions['path.0'] = fromUrlString(path.categoryName)
        if(path.groupName){
            queryOptions['path.1'] = fromUrlString(path.groupName)
        }
        if(path.subGroupName){
            queryOptions['path.2'] = fromUrlString(path.subGroupName)
        }
        const {minPrice, maxPrice} = await this.getPriceRange(queryOptions)
        const filtersQuery = this.formFilterQuery(filters, minPrice, maxPrice)
        queryOptions = {...queryOptions, ...filtersQuery}
        let query = this.productModel.find(queryOptions)
         .populate([
            {path: 'looks',
            select: 'items image orientation',
            populate: 'image'
            },
            {path: 'category', 
            select: 'title path level pathString', 
            populate: {path: 'path', select: 'title'}
            },
            'image',
            'media',
            'relatedProducts'
        ])

        if(filters.sort && /^\[(price-up|price-down|new|popular)\]$/.test(filters.sort)){
            const sortOptions = {
                'price-up': {price: 1},
                'price-down': {price: -1},
                'new': 'createdAt'
            }
            const sortType = filters.sort.slice(1, -1)
            query = query.sort(sortOptions[sortType])
        }      
        console.log('queryOptions', queryOptions)
        const products = await query
        
        return {count: products.length, products, minPrice, maxPrice, category}
    }

      async searchProducts(filters: IFilters): Promise<ISearchResponse>{
        let queryOptions: FilterQuery<ProductDocument> = {enable: true}
        if(filters.search){
            queryOptions.title = {'$regex': new RegExp(filters.search, 'i')}
        }
        const {minPrice, maxPrice} = await this.getPriceRange(queryOptions)
        const total = await this.productModel.count(queryOptions)
        const filtersQuery = this.formFilterQuery(filters, minPrice, maxPrice)
        queryOptions = {...queryOptions, ...filtersQuery}
        let query = this.productModel.find(queryOptions)
         .populate([
            {path: 'looks',
            select: 'items image orientation',
            populate: 'image'
            },
            {path: 'category', 
            select: 'title path level pathString', 
            populate: {path: 'path', select: 'title'}
            },
            'image',
            'media',
            'relatedProducts'
        ])

        if(filters.sort && /^\[(price-up|price-down|new|popular)\]$/.test(filters.sort)){
            const sortOptions = {
                'price-up': {price: 1},
                'price-down': {price: -1},
                'new': 'createdAt'
            }
            const sortType = filters.sort.slice(1, -1)
            query = query.sort(sortOptions[sortType])
        }      
        const products = await query
        
        return {total, products, minPrice, maxPrice}
    }

    async update(id: mongoose.Types.ObjectId, dto: UpdateProductDto, image: Express.Multer.File | undefined, media: Express.Multer.File[]): Promise<ProductDocument>{
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        const product = await this.productModel.findById(id)
        if(!product) throw new NotFoundException('Product not found')
        const updateOptions: UpdateQuery<ProductDocument> = {'$set': {...dto}}
        if(dto.category && product.category !== dto.category){
            await this.categoriesService.unlinkProduct(product.category, id)
            await this.categoriesService.linkProduct(dto.category, id)
            const category = await this.categoriesService.get(dto.category)
            updateOptions['$set'].path = category.path
            updateOptions['$set'].pathString = category.path.map(x => capitalize(x)).join('/')
        }
        if(image){
            await this.filesService.removeFile(product.image)
            const newImage = await this.filesService.uploadFile(image)
            updateOptions['$set'].image = newImage
        }
        if(media){
            const newMedia = await Promise.all(media.map(file => this.filesService.uploadFile(file)))
            updateOptions['$push'] = {media: {'$each': newMedia}}
        }
        if(dto.mediaToRemove){
            await Promise.all(dto.mediaToRemove.map(file => this.filesService.removeFile(file)))
            updateOptions['$pull'] = {media: {'$in': dto.mediaToRemove}}
        }

        return await this.productModel.findByIdAndUpdate(id, updateOptions, {new: true})
    }

    async delete(id: mongoose.Types.ObjectId){
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        const product = await this.productModel.findById(id)
        const orderItems = await this.orderItemModel.find({product: id})
        if(orderItems.length > 0){
            throw new BadRequestException('You can\'t delete product before all order items with this product are removed')
        }
        await this.filesService.removeFile(product.image)
        await Promise.all(product.media.map(file => this.filesService.removeFile(file)))
        await product.remove()
        await this.categoriesService.unlinkProduct(product.category, id)
        return product._id
    }

    async deleteMany(ids: mongoose.Types.ObjectId[]){
        return await Promise.all(ids.map(id => this.delete(id)))
    }

    async assignToCategory(products: mongoose.Types.ObjectId[], category: CategoryDocument){
        const pathString = category.path.map(x => capitalize(x)).join('/')
        return await this.productModel.updateMany({_id: {'$in': products}}, {'$set': {category: category.id, path: category.path, pathString}})
    }

    async clearCategory(products: mongoose.Types.ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {'$unset': {category: 1}, 'path': [], 'pathString': 'No category'})
    }

    async enableProducts(products: mongoose.Types.ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {enable: true})
    }

     async disableProducts(products: mongoose.Types.ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {enable: false})
    }

    async getProductsByIds(ids: mongoose.Types.ObjectId[]){
        return await this.productModel.find({_id: {'$in': ids}})
    }

    async addRelatedProducts(id: mongoose.Types.ObjectId, products: mongoose.Types.ObjectId[]){
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        await this.productModel.findByIdAndUpdate(id, {'$push': {relatedProducts: {'$each': products}}})
        await this.productModel.updateMany({_id: {'$in': products}}, {'$push': {relatedProducts: id}})
    }

    async removeRelatedProducts(id: mongoose.Types.ObjectId, products: mongoose.Types.ObjectId[]){
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new NotFoundException(`Product with id ${id} doesn't exist`)
        }
        await this.productModel.findByIdAndUpdate(id, {'$pull': {relatedProducts: {'$in': products}}})
        await this.productModel.updateMany({_id: {'$in': products}}, {'$pull': {relatedProducts: id}})
    }

    private async getPriceRange(queryOptions: object): Promise<{minPrice: number, maxPrice: number}>{
        let maxPrice: number, minPrice: number
        const highestPriceProduct = await this.productModel.findOne(queryOptions, {price: 1, _id:0}).sort({price: -1}).limit(1)
        if(highestPriceProduct) maxPrice = highestPriceProduct.price
        const lowestPriceProduct = await this.productModel.findOne(queryOptions, {price: 1, _id:0}).sort({price: 1}).limit(1)
        if(lowestPriceProduct) minPrice = lowestPriceProduct.price
        return {minPrice, maxPrice}
    }

    private formFilterQuery(filters: IFilters, minPrice: number, maxPrice: number): FilterQuery<ProductDocument>{
        const {sizes, colors, price, sale} = filters
        let filtersQuery: FilterQuery<ProductDocument> = {}
        //all filters have format of '[a b c ...]', except '[a b]' for price
        if(price  && /^\[\d+(\.\d+)?(\s\d+(\.\d+)?)?\]$/.test(price)){
            //cutting of '[' and ']' braces
            const prices = price.slice(1, -1).split(' ')
            let min = Number(prices[0])
            let max = Number(prices[1])
            if(min > maxPrice || min < minPrice || min > max) min = minPrice
            if(max > maxPrice || max < minPrice) max = maxPrice
            if(min){
                filtersQuery.price = {'$gte': min}
            }
            if(max){
                filtersQuery.price['$lte'] =  max
            }
        }

        if(sizes && /\[(xs|s|m|l|xl|xxl)(\s(xs|s|m|l|xl|xxl))*\]/i.test(sizes)){
            let sizeValues = sizes.slice(1, -1).split(' ') 
            sizeValues = sizeValues.map(x => x.toLowerCase())
            filtersQuery['sizes'] = {'$in': sizeValues as Size[]}
        }

        if(colors && /\[[A-Za-z]+(\s[A-Za-z]+)*\]/.test(colors)){
            const colorValues = colors.slice(1, -1).split(' ')
            filtersQuery.color = {'$in': colorValues}
        }

        if(sale !== undefined){
            filtersQuery.comparePrice = {'$exists': true, '$nin': [null, 0]}
        }
            return filtersQuery
    }
}
