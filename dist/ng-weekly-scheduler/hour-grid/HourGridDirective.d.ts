/**
 * Generates a grid row that shows the hours as labels
 */
import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from '../hour-text/HourTextService';
/** @internal */
export declare class HourGridDirective implements angular.IDirective {
    private gridGeneratorService;
    private hourTextService;
    static $name: string;
    restrict: string;
    require: string;
    private tickCount;
    private handleClickEvent(child, hourCount, idx, scope);
    private doGrid(scope, element);
    private createHourGenerationStrategy(scope);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(gridGeneratorService: GridGeneratorService, hourTextService: HourTextService);
    static Factory(): (gridGeneratorService: any, hourTextService: any) => HourGridDirective;
}
