/// <reference types="angular" />
import * as angular from 'angular';
import { MinimumSeparationValidatorService } from '../schedule-validator/MinimumSeparationValidatorService';
/** @internal */
export declare class MinimumSeparationDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: MinimumSeparationValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => MinimumSeparationDirective;
}
