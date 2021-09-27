import { SetMetadata } from '@nestjs/common';
import { Action } from 'src/casl/casl-ability.factory';

export const ACTION_TYPE = 'action-type';
export const ActionType = (action: Action) => SetMetadata(ACTION_TYPE, action)