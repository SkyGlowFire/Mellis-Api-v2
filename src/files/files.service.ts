import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {FileDocument, FileType, File} from './schemas/file.schema'
import {Express} from 'express'
import * as uuid from 'uuid'
import {S3} from 'aws-sdk'
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';

@Injectable()
export class FilesService {

    constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>){}

    async uploadFile(file: Express.Multer.File): Promise<ObjectId>{
        
        try {
            const fileExtension = file.originalname.split('.').pop()
            const fileName = uuid.v4() + '.' + fileExtension
            const s3 = new S3()
            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Body: file.buffer,
                Key: fileName
            }).promise()
            const newFile = await this.fileModel.create({
                name: uploadResult.Key,
                url: uploadResult.Location,
                type: file.mimetype.split('/').shift()
            })
            return newFile.id
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

      async removeFile(id: Schema.Types.ObjectId): Promise<ObjectId>{
        
        try {
            const file = await this.fileModel.findById(id)
            if(!file) throw new NotFoundException('File not found')
            const s3 = new S3()
            await s3.deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.name,
                }).promise();
            await file.remove()
            return file.id
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
