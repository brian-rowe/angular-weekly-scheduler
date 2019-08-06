/// <reference types="angular" />
import * as angular from 'angular';
import { MonoScheduleValidatorService } from '../schedule-validator/MonoScheduleValidatorService';
/** @internal */
export declare class MonoScheduleDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: MonoScheduleValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => MonoScheduleDirective;
}
