import { IPointProvider } from './IPointProvider';
import { IPoint } from './IPoint';

export class HorizontalPointProvider implements IPointProvider {
    getValue(point: IPoint) {
        return point.x;
    }
}
