import * as angular from 'angular';
import { IWeeklySchedulerFilterService } from '../weekly-scheduler-config/IWeeklySchedulerFilterService';
/** @internal */
export declare class RestrictionExplanationsController implements angular.IComponentController {
    private $filter;
    static $controllerAs: string;
    static $name: string;
    static $inject: string[];
    private schedulerCtrl;
    private explanations;
    constructor($filter: IWeeklySchedulerFilterService);
    $onInit(): void;
}
/** @internal */
export declare class RestrictionExplanationsComponent implements angular.IComponentOptions {
    static $name: string;
    controller: string;
    controllerAs: string;
    require: {
        schedulerCtrl: string;
    };
    template: string;
}
