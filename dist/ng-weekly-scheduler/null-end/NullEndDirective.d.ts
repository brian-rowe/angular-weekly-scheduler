/// <reference types="angular" />
import * as angular from 'angular';
import { NullEndScheduleValidatorService } from '../schedule-validator/NullEndValidatorService';
/** @internal */
export declare class NullEndDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: NullEndScheduleValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => NullEndDirective;
}
