/// <reference types="angular" />
import * as angular from 'angular';
import { MaxTimeSlotValidatorService } from '../schedule-validator/MaxTimeSlotValidatorService';
/** @internal */
export declare class MaxTimeSlotDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: MaxTimeSlotValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => MaxTimeSlotDirective;
}
