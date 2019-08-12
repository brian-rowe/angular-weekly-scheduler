/// <reference types="angular" />
import { ElementOffsetService } from '../element-offset/ElementOffsetService';
import { IPoint } from '../point/IPoint';
/**
 * Gets mouse position relative to the calendar element.
 * (as opposed to mouse-tracker, which gets the mouse position relative to the document)
 */
export declare class MousePositionService {
    private elementOffsetService;
    static $name: string;
    static $inject: string[];
    constructor(elementOffsetService: ElementOffsetService);
    getMousePosition($element: angular.IAugmentedJQuery, point: IPoint): number;
}
