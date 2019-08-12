import { IPointProvider } from './IPointProvider';
import { IPoint } from './IPoint';
export declare class HorizontalPointProvider implements IPointProvider {
    getValue(point: IPoint): number;
}
