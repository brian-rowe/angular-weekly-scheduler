/// <reference types="angular" />
import * as angular from 'angular';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { ElementOffsetService } from '../element-offset/ElementOffsetService';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
/** @internal */
export declare class MultiSliderController implements angular.IComponentController {
    private $element;
    private $q;
    private $scope;
    private elementOffsetService;
    private endAdjusterService;
    private mouseTrackerService;
    private nullEndWidth;
    private rangeFactory;
    private valueNormalizationService;
    static $name: string;
    static $controllerAs: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery, $q: angular.IQService, $scope: angular.IScope, elementOffsetService: ElementOffsetService, endAdjusterService: EndAdjusterService, mouseTrackerService: MouseTrackerService, nullEndWidth: number, rangeFactory: WeeklySchedulerRangeFactory, valueNormalizationService: ValueNormalizationService);
    private dragSchedule;
    private pendingSchedule;
    private startingGhostValues;
    private readonly ghostValues;
    private setGhostValues;
    private ngModelCtrl;
    element: Element;
    config: IWeeklySchedulerConfig<any>;
    private item;
    $postLink(): void;
    private onMouseEnter();
    private onMouseLeave();
    private onMouseUp();
    private addDragSchedule();
    private removeDragSchedule();
    private commitDragSchedule();
    private getScheduleForAdd(start, end);
    private openEditorForAdd(schedule);
    /** Expand ghost while dragging in it */
    adjustGhost(): void;
    /** Move ghost around while not dragging */
    positionGhost(): void;
    onGhostWrapperMouseDown(): void;
    onGhostWrapperMouseMove(): void;
    onGhostWrapperMouseUp(): void;
    private createGhost();
    private commitGhost(ghostSchedule);
    private getMousePosition(pageX);
    private getValAtMousePosition(pageX);
    /**
     * Perform an external action to bring up an editor for a schedule
     */
    private editSchedule(schedule);
    private getSlotLeft(start);
    private getSlotRight(start, end);
    private getSlotStyle(schedule);
    private getUnderlyingInterval(val);
    private shouldDelete(schedule);
    pixelToVal(pixel: number): number;
    private normalizeIntervalValue(value);
    private normalizeGhostValue(value);
    private removeGhost();
}
/** @internal */
export declare class MultiSliderComponent implements angular.IComponentOptions {
    static $name: string;
    bindings: {
        config: string;
        dragSchedule: string;
        ghostValues: string;
        item: string;
        setGhostValues: string;
    };
    controller: string;
    controllerAs: string;
    require: {
        ngModelCtrl: string;
    };
    template: any;
}
