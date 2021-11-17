import { Model, Types } from 'mongoose';

export interface TokenPayload{
    sub: Types.ObjectId
}