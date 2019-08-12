import { IPoint } from './IPoint';
export interface IPointProvider {
    getValue(point: IPoint): any;
}
