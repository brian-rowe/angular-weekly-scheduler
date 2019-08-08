import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from "../hour-text/HourTextService";
/** @internal */
export declare class HourlyGridDirective implements angular.IDirective {
    private timeConstants;
    private gridGeneratorService;
    private hourTextService;
    static $name: string;
    restrict: string;
    require: string;
    private tickCount;
    private interval;
    private intervalsInTick;
    private intervalPercentage;
    private handleClickEvent(child, hourCount, idx, scope);
    private doGrid(scope, element, attrs);
    private createHourGenerationStrategy(scope);
    private createIntervalGenerationStrategy();
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(timeConstants: TimeConstantsService, gridGeneratorService: GridGeneratorService, hourTextService: HourTextService);
    static Factory(): (timeConstants: any, gridGeneratorService: any, hourTextService: any) => HourlyGridDirective;
}
