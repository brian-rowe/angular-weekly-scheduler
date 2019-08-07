import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
/** @internal */
export declare class DailyGridDirective implements angular.IDirective {
    private timeConstants;
    private gridGeneratorService;
    static $name: string;
    restrict: string;
    require: string;
    private tickCount;
    private interval;
    private intervalsInTick;
    private intervalPercentage;
    private handleClickEvent(child, hourCount, idx, scope);
    private generateDayText(day);
    private doGrid(scope, element, attrs);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(timeConstants: TimeConstantsService, gridGeneratorService: GridGeneratorService);
    static Factory(): (timeConstants: any, gridGeneratorService: any) => DailyGridDirective;
}
