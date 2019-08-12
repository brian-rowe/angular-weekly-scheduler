import { IPointProvider } from './IPointProvider';
import { IPoint } from './IPoint';

export class VerticalPointProvider implements IPointProvider {
    getValue(point: IPoint) {
        return point.y;
    }
}
