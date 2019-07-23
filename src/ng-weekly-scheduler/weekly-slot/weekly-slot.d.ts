/// <reference types="angular" />
import * as angular from 'angular';
import { DragService } from '../drag/DragService';
/** @internal */
export declare class WeeklySlotController implements angular.IComponentController {
    private $element;
    private $rootScope;
    private $scope;
    private dragService;
    static $name: string;
    static $controllerAs: string;
    static $inject: string[];
    private config;
    private ngModelCtrl;
    private editSchedule;
    private getDelta;
    private item;
    private dragSchedule;
    private schedule;
    private valuesOnDragStart;
    constructor($element: angular.IAugmentedJQuery, $rootScope: angular.IRootScopeService, $scope: angular.IScope, dragService: DragService);
    readonly hasDragSchedule: boolean;
    private getDragStartValues();
    editSelf(): void;
    drag(pixel: number): void;
    endDrag(): void;
    endResize(): void;
    resizeStart(pixel: number): void;
    resizeEnd(pixel: number): void;
    startDrag(): void;
    startResize(): void;
}
/** @internal */
export declare class WeeklySlotComponent implements angular.IComponentOptions {
    static $name: string;
    bindings: {
        config: string;
        dragSchedule: string;
        item: string;
        schedule: string;
        editSchedule: string;
        getDelta: string;
    };
    controller: string;
    controllerAs: string;
    require: {
        ngModelCtrl: string;
    };
    template: any;
}
