import { IPointProvider } from './IPointProvider';
import { IPoint } from './IPoint';
export declare class VerticalPointProvider implements IPointProvider {
    getValue(point: IPoint): number;
}
