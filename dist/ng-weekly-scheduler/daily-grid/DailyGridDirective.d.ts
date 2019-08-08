import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { DayMap } from '../weekly-scheduler-config/DayMap';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
import { TimeConstantsService } from '../time/TimeConstantsService';
/** @internal */
export declare class DailyGridDirective implements angular.IDirective {
    private dayMap;
    private gridGeneratorService;
    private intevalGenerationService;
    private timeConstants;
    static $name: string;
    restrict: string;
    require: string;
    private config;
    private tickCount;
    private handleClickEvent(child, hourCount, idx, scope);
    private generateDayText(day);
    private doGrid(scope, element, attrs);
    private createDayGenerationStrategy(scope);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(dayMap: DayMap, gridGeneratorService: GridGeneratorService, intevalGenerationService: IntervalGenerationService, timeConstants: TimeConstantsService);
    static Factory(): (dayMap: any, gridGeneratorService: any, intervalGenerationService: any, timeConstants: any) => DailyGridDirective;
}
