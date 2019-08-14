import { IPoint } from '../point/IPoint';
import { ElementOffsetProviderFactory } from '../element-offset/ElementOffsetProviderFactory';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { PointProviderFactory } from '../point/PointProviderFactory';

/**
 * Gets cursor position relative to the calendar element.
 * (as opposed to mouse-tracker, which gets the mouse position relative to the document)
 */
export class CursorPositionService {
    static $name = 'rrWeeklySchedulerCursorPositionService'

    static $inject = [
        ElementOffsetProviderFactory.$name,
        PointProviderFactory.$name
    ]

    constructor(
        private elementOffsetProviderFactory: ElementOffsetProviderFactory,
        private pointProviderFactory: PointProviderFactory
    ) {
    }

    public getCursorPosition(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, point: IPoint) {
        let elementOffsetProvider = this.elementOffsetProviderFactory.getElementOffsetProvider(config);
        let elementOffset = elementOffsetProvider.getElementOffset($element);

        let pointProvider = this.pointProviderFactory.getPointProvider(config);
        let pointValue = pointProvider.getValue(point);

        let position = pointValue - elementOffset;

        return position;
    }
}
