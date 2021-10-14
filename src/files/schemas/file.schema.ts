import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import {Document, ObjectId} from 'mongoose'

export type FileDocument = Document & File

export enum FileType{
    'video', 'image'
}

@Schema()
export class File{
    
    @Prop({required: [true, 'Please add file name']})
    name: string

    @Prop({required: [true, 'Please add file url']})
    url: string

    @Prop({required: [true, 'Please add file type'], enum: ['image', 'video'], type: String})
    fileType: FileType

}

export const FileSchema = SchemaFactory.createForClass(File)