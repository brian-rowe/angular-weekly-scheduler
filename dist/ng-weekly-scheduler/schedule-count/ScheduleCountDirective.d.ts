/// <reference types="angular" />
import * as angular from 'angular';
import { ScheduleCountValidatorService } from '../schedule-validator/ScheduleCountValidatorService';
/** @internal */
export declare class ScheduleCountDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: ScheduleCountValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => ScheduleCountDirective;
}
