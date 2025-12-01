
import { User } from './user';

export interface Class {
    id: string;
    title: string;
    description: string;
    instructor: User;
    startTime: Date;
    endTime: Date;
    capacity: number;
}
