import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
/** @internal */
export declare class DailyGridDirective implements angular.IDirective {
    private gridGeneratorService;
    private intevalGenerationService;
    static $name: string;
    restrict: string;
    require: string;
    private config;
    private tickCount;
    private doGrid(scope, element, attrs);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(gridGeneratorService: GridGeneratorService, intevalGenerationService: IntervalGenerationService);
    static Factory(): (gridGeneratorService: any, intervalGenerationService: any) => DailyGridDirective;
}
