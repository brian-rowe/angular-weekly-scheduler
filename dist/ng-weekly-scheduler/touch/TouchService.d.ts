import { IPoint } from '../point/IPoint';
/** @internal */
export declare class TouchService {
    static $name: string;
    private getTouches(event);
    getPoint(event: any): IPoint;
    getPageX(event: any): number;
    getPageY(event: any): number;
}
