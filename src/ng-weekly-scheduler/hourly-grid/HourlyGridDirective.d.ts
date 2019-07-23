import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
/** @internal */
export declare class HourlyGridDirective implements angular.IDirective {
    private timeConstants;
    static $name: string;
    restrict: string;
    require: string;
    private GRID_TEMPLATE;
    private handleClickEvent(child, hourCount, idx, scope);
    private doGrid(scope, element, attrs, config);
    link: (scope: any, element: any, attrs: any, schedulerCtrl: WeeklySchedulerController) => void;
    constructor(timeConstants: TimeConstantsService);
    static Factory(): (timeConstants: any) => HourlyGridDirective;
}
