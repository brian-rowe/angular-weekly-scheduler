import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ElementOffsetService } from '../element-offset/ElementOffsetService';
import { IPoint } from '../point/IPoint';

/**
 * Gets mouse position relative to the calendar element.
 * (as opposed to mouse-tracker, which gets the mouse position relative to the document)
 */
export class MousePositionService {
    static $name = 'rrWeeklySchedulerMousePositionService'

    static $inject = [
        ElementOffsetService.$name
    ]

    constructor(
        private elementOffsetService: ElementOffsetService
    ) {
    }

    public getMousePosition($element: angular.IAugmentedJQuery, point: IPoint) {
        let elementOffset = this.elementOffsetService.left($element);
        let position = point.x - elementOffset;

        return position;
    }
}
