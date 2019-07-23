/// <reference types="angular" />
import * as angular from 'angular';
import { OverlapValidatorService } from '../schedule-validator/OverlapValidatorService';
/** @internal */
export declare class OverlapDirective implements angular.IDirective {
    private validator;
    static $name: string;
    constructor(validator: OverlapValidatorService);
    link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => void;
    require: string;
    static Factory(): (validator: any) => OverlapDirective;
}
