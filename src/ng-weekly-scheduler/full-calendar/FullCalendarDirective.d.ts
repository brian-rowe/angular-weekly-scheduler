/// <reference types="angular" />
import * as angular from 'angular';
import { FullCalendarValidatorService } from '../schedule-validator/FullCalendarValidatorService';
/** @internal */
export declare class FullCalendarDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: FullCalendarValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => FullCalendarDirective;
}
