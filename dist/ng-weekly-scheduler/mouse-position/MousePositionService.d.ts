/// <reference types="angular" />
import { IPoint } from '../point/IPoint';
import { ElementOffsetProviderFactory } from '../element-offset/ElementOffsetProviderFactory';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { PointProviderFactory } from '../point/PointProviderFactory';
/**
 * Gets mouse position relative to the calendar element.
 * (as opposed to mouse-tracker, which gets the mouse position relative to the document)
 */
export declare class MousePositionService {
    private elementOffsetProviderFactory;
    private pointProviderFactory;
    static $name: string;
    static $inject: string[];
    constructor(elementOffsetProviderFactory: ElementOffsetProviderFactory, pointProviderFactory: PointProviderFactory);
    getMousePosition(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, point: IPoint): number;
}
