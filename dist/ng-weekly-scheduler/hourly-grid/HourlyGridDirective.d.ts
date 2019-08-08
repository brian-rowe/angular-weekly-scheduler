/**
 * Generates a grid that conforms to hours that is used as a backdrop for the calendar to provide snap values
 */
import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
/** @internal */
export declare class HourlyGridDirective implements angular.IDirective {
    private timeConstants;
    private gridGeneratorService;
    private intervalGenerationService;
    static $name: string;
    restrict: string;
    require: string;
    private config;
    private tickCount;
    private doGrid(scope, element, attrs);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(timeConstants: TimeConstantsService, gridGeneratorService: GridGeneratorService, intervalGenerationService: IntervalGenerationService);
    static Factory(): (timeConstants: any, gridGeneratorService: any, intervalGenerationService: any) => HourlyGridDirective;
}
