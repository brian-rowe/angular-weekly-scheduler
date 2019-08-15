/// <reference types="angular" />
import { IPoint } from '../point/IPoint';
import { ElementOffsetProviderFactory } from '../element-offset/ElementOffsetProviderFactory';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { PointProviderFactory } from '../point/PointProviderFactory';
/**
 * Gets cursor position relative to the calendar element.
 * (as opposed to cursor-tracker, which gets the cursor position relative to the document)
 */
export declare class CursorPositionService {
    private elementOffsetProviderFactory;
    private pointProviderFactory;
    static $name: string;
    static $inject: string[];
    constructor(elementOffsetProviderFactory: ElementOffsetProviderFactory, pointProviderFactory: PointProviderFactory);
    getCursorPosition(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, point: IPoint): number;
}
