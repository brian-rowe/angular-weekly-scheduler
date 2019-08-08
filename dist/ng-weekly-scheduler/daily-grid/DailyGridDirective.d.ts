import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
/** @internal */
export declare class DailyGridDirective implements angular.IDirective {
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
    private createDayGenerationStrategy(scope);
    private createIntervalGenerationStrategy();
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(gridGeneratorService: GridGeneratorService);
    static Factory(): (gridGeneratorService: any) => DailyGridDirective;
}
