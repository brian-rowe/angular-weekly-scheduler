/// <reference types="angular" />
import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { SlotStyleFactory } from '../slot-style/SlotStyleFactory';
import { PixelToValService } from '../pixel-to-val/PixelToValService';
import { MousePositionService } from '../mouse-position/MousePositionService';
import { TouchService } from '../touch/TouchService';
/** @internal */
export declare class MultiSliderController implements angular.IComponentController {
    private $element;
    private $q;
    private $scope;
    private mousePositionService;
    private mouseTrackerService;
    private nullEndWidth;
    private pixelToValService;
    private slotStyleFactory;
    private touchService;
    private rangeFactory;
    private valueNormalizationService;
    static $name: string;
    static $controllerAs: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery, $q: angular.IQService, $scope: angular.IScope, mousePositionService: MousePositionService, mouseTrackerService: MouseTrackerService, nullEndWidth: number, pixelToValService: PixelToValService, slotStyleFactory: SlotStyleFactory, touchService: TouchService, rangeFactory: WeeklySchedulerRangeFactory, valueNormalizationService: ValueNormalizationService);
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
    private getScheduleForAdd(range);
    private getGhostSlotStyle();
    private getSlotStyle(schedule);
    private openEditorForAdd(schedule);
    /** Expand ghost while dragging in it */
    adjustGhost(event?: Event): void;
    /** Move ghost around while not dragging */
    positionGhost(event?: Event): void;
    onGhostWrapperMouseDown(event: Event): void;
    onGhostWrapperMouseMove(event: any): void;
    onGhostWrapperMouseUp(): void;
    private createGhost(event?);
    private commitGhost(ghostSchedule);
    private getValAtMousePosition(event?);
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
