/// <reference types="angular" />
import { ScrollService } from '../scroll/ScrollService';
import { ZoomService } from '../zoom/ZoomService';
/** @internal */
export declare class ScheduleAreaContainerController implements angular.IComponentController {
    private $element;
    private $scope;
    private scrollService;
    private zoomService;
    static $name: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery, $scope: angular.IScope, scrollService: ScrollService, zoomService: ZoomService);
    $postLink(): void;
}
/** @internal */
export declare class ScheduleAreaContainerComponent implements angular.IComponentOptions {
    static $name: string;
    controller: string;
    transclude: boolean;
    template: any;
}
