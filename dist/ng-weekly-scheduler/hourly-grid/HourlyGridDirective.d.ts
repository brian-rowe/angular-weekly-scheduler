import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from '../hour-text/HourTextService';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
/** @internal */
export declare class HourlyGridDirective implements angular.IDirective {
    private timeConstants;
    private gridGeneratorService;
    private hourTextService;
    private intervalGenerationService;
    static $name: string;
    restrict: string;
    require: string;
    private config;
    private tickCount;
    private handleClickEvent(child, hourCount, idx, scope);
    private doGrid(scope, element, attrs);
    private createHourGenerationStrategy(scope);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(timeConstants: TimeConstantsService, gridGeneratorService: GridGeneratorService, hourTextService: HourTextService, intervalGenerationService: IntervalGenerationService);
    static Factory(): (timeConstants: any, gridGeneratorService: any, hourTextService: any, intervalGenerationService: any) => HourlyGridDirective;
}
