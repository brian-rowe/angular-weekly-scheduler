/// <reference types="angular" />
import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { ElementOffsetService } from '../element-offset/ElementOffsetService';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { SlotStyleFactory } from '../slot-style/SlotStyleFactory';
import { PixelToValService } from '../pixel-to-val/PixelToValService';
/** @internal */
export declare class MultiSliderController implements angular.IComponentController {
    private $element;
    private $q;
    private $scope;
    private elementOffsetService;
    private mouseTrackerService;
    private nullEndWidth;
    private pixelToValService;
    private slotStyleFactory;
    private rangeFactory;
    private valueNormalizationService;
    static $name: string;
    static $controllerAs: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery, $q: angular.IQService, $scope: angular.IScope, elementOffsetService: ElementOffsetService, mouseTrackerService: MouseTrackerService, nullEndWidth: number, pixelToValService: PixelToValService, slotStyleFactory: SlotStyleFactory, rangeFactory: WeeklySchedulerRangeFactory, valueNormalizationService: ValueNormalizationService);
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
    private getSlotStyle(schedule);
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
    private shouldDelete(schedule);
    pixelToVal(pixel: number): number;
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
