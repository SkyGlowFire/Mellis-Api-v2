import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, UpdateQuery, } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { FilesService } from 'src/files/files.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

export interface IFilters{
    size?: string
    color?: string
    price?: string
    sort?: string
    sale?: string
}

interface IFiltersQuery{
    sizes?: object
    color?: object
    price?: object
    comparePrice?: object
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
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>, 
        private categoriesService: CategoriesService,
        private filesService: FilesService 
        ){}
//@Inject(forwardRef(() => CategoriesService)) 
    async createProduct(dto: CreateProductDto, image: Express.Multer.File, media: Express.Multer.File[]){
        const imageId = await this.filesService.uploadFile(image)
        let mediaIds = []
        if(media){
            mediaIds = await Promise.all(media.map(file => this.filesService.uploadFile(file)))
        }
        const product = await this.productModel.create({...dto, image: imageId, media: mediaIds})
        return product
    }

    async get(id: ObjectId): Promise<ProductDocument>{
        return await this.productModel.findOne({_id: id, enable: true}).populate(['category', 'image', 'media'])
    }

    async getAny(id: ObjectId): Promise<ProductDocument>{
        return await this.productModel.findById(id).populate(['category', 'image', 'media'])
    }

    async getAll(): Promise<ProductDocument[]>{
        return await this.productModel.find().populate(['image', 'category'])
    }

    async getByCategory(path: IPath, filters: IFilters): Promise<IProductsResponse>{
        let queryOptions = {enable: true}
        const categoryId = await this.categoriesService.getCategoryIdByPath(path)
        const {products: productIds} = await this.categoriesService.parseChildren(categoryId)
        const filtersQuery = this.formFilterQuery(filters)
        queryOptions['_id'] = {'$in': productIds, ...filtersQuery}

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

        if(filters.sort && /^\[(price_low-high|price_high-low|new|popular)\]$/.test(filters.sort)){
            const sortOptions = {
                'price_low-high': {price: 1},
                'price_high-low': {price: -1},
                'new': 'createdAt'
            }
            const sortType = filters.sort.slice(1, -1)
            query = query.sort(sortOptions[sortType])
        }

        const {minPrice, maxPrice} = await this.getPriceRange(queryOptions)
        const products = await query
        
        return {count: products.length, products, minPrice, maxPrice}
    }

    async update(id: ObjectId, dto: UpdateProductDto, image: Express.Multer.File, media: Express.Multer.File[]): Promise<ProductDocument>{
        const product = await this.productModel.findById(id)
        if(!product) throw new NotFoundException('Product not found')
        if(dto.category && product.category !== dto.category){
            await this.categoriesService.linkProduct(dto.category, id)
        }
        const updateOptions: UpdateQuery<ProductDocument> = {'$set': {...dto}}
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

    async delete(id: ObjectId){
        const product = await this.productModel.findById(id)
        await this.filesService.removeFile(product.image)
        await Promise.all(product.media.map(file => this.filesService.removeFile(file)))
        await product.remove()
        return product._id
    }

    async deleteMany(ids: ObjectId[]){
        return await Promise.all(ids.map(id => this.delete(id)))
    }

    async assignToCategory(products: ObjectId[], category: ObjectId){
        return await this.productModel.updateMany({_id: {'$in': products}}, {'$set': {category}})
    }

    async clearCategory(products: ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {'$unset': {category: 1}})
    }

    async enableProducts(products: ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {enable: true})
    }

     async disableProducts(products: ObjectId[]){
        return await this.productModel.updateMany({_id: {'$in': products}}, {enable: false})
    }

    async getProductsByIds(ids: ObjectId[]){
        return await this.productModel.find({_id: {'$in': ids}})
    }

    async addRelatedProducts(id: ObjectId, products: ObjectId[]){
        await this.productModel.findByIdAndUpdate(id, {'$push': {relatedProducts: {'$each': products}}})
        await this.productModel.updateMany({_id: {'$in': products}}, {'$push': {relatedProducts: id}})
    }

    async removeRelatedProducts(id: ObjectId, products: ObjectId[]){
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

    private formFilterQuery(filters: IFilters): IFiltersQuery{
        const {size, color, price, sale} = filters
        let filtersQuery: IFiltersQuery = {}
        //all filters have format of '[a b c ...]', except '[a b]' for price
        if(price  && /^\[\d+(\.\d+)?(\s\d+(\.\d+)?)?\]$/.test(price)){
            //cutting of '[' and ']' braces
            const prices = price.slice(1, -1).split(' ')
            if(prices[0]){
                filtersQuery.price = {'$gte': Number(prices[0])}
            }
            if(prices[1]){
                filtersQuery.price['$lte'] =  Number(prices[1])
            }
        }

        if(size && /\[(xs|s|m|l|xl|xxl)(\s(xs|s|m|l|xl|xxl))*\]/i.test(size)){
            let sizes = size.slice(1, -1).split(' ')
            sizes = sizes.map(x => x.toLowerCase())
            filtersQuery['sizes'] = {'$in': sizes}
        }

        if(color && /\[[A-Za-z]+(\s[A-Za-z]+)*\]/.test(color)){
            const colors = color.slice(1, -1).split(' ')
            filtersQuery.color = {'$in': colors}
        }

        if(sale !== undefined){
            filtersQuery.comparePrice = {'$exists': true, '$nin': [null, 0]}
        }
            return filtersQuery
    }
}
