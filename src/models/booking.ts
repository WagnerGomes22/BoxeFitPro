
import { User } from './user';
import { Class } from './class';

export enum BookingStatus {
    CONMEFIRD = 'confirmed',
    CANCELLED = 'cancelled',
}

export interface Booking {
    id: string;
    user: User;
    class: Class;
    status: BookingStatus;
}
