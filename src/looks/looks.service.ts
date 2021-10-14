import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, UpdateQuery } from 'mongoose';
import { FilesService } from 'src/files/files.service';
import { CreateLookDto } from './dto/create-look.dto';
import { UpdateLookDto } from './dto/update-look.dto';
import { Look, LookDocument } from './schemas/look.schema';

@Injectable()
export class LooksService {
     constructor(
        @InjectModel(Look.name) private lookModel: Model<LookDocument>,
        private filesService: FilesService){}

    async getLooks(): Promise<LookDocument[]>{
        const looks = await this.lookModel.find({enable: true}).populate([
            'image', {path: 'items', populate: 'image'}
        ])
        return looks
    }

     async getAllLooks(): Promise<LookDocument[]>{
        const looks = await this.lookModel.find().populate('items').populate([
            'image', {path: 'items', populate: 'image'}
        ])
        return looks
    }

     async getLook(id: ObjectId): Promise<LookDocument>{
        const look = await this.lookModel.findOne({enable: true, _id:id}).populate('image')
        return look
    }

     async getAnyLook(id: ObjectId): Promise<LookDocument>{
        const look = await this.lookModel.findById(id).populate('image')
        return look
    }

     async createLook(dto: CreateLookDto, image: Express.Multer.File){
        const imageId = await this.filesService.uploadFile(image)
        const look = await this.lookModel.create({...dto, image: imageId})
        return look
    }

      async updateLook(id: ObjectId, dto: UpdateLookDto, image: Express.Multer.File){
        const look = await this.lookModel.findById(id)
        const updateOptions: UpdateQuery<LookDocument> = {'$set': {...dto}}
        if(image){
            await this.filesService.removeFile(look.image)
            const newImage = await this.filesService.uploadFile(image)
            updateOptions['$set'].image = newImage
        }
        // const removedItems = look.items.filter(x => !dto.items.includes(x))
        // const addedItems = dto.items.filter(x => !look.items.includes(x))
        // updateOptions['$push'] = {items: {'$each': addedItems}}
        // updateOptions['$pull'] = {items: {'$in': removedItems}}
        return await this.lookModel.findByIdAndUpdate(id, updateOptions, {new: true})
    }

    async delete(id: ObjectId){
        const look = await this.lookModel.findById(id)
        await this.filesService.removeFile(look.image)
        await look.remove()
        return look._id
    }

    async deleteMany(ids: ObjectId[]){
        return await Promise.all(ids.map(id => this.delete(id)))
    }

    async enableLooks(looks: ObjectId[]){
        return await this.lookModel.updateMany({_id: {'$in': looks}}, {enable: true})
    }

     async disableLooks(looks: ObjectId[]){
        return await this.lookModel.updateMany({_id: {'$in': looks}}, {enable: false})
    }
}
