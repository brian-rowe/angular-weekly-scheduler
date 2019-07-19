import * as angular from 'angular';
import { MinimumSeparationValidatorService } from '../schedule-validator/MinimumSeparationValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
class MinimumSeparationDirective implements angular.IDirective {
    static $name = 'brMinimumSeparation';

    constructor(
        private validator: MinimumSeparationValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brMinimumSeparation) {
            ngModelCtrl.$validators[this.validator.error] = (modelValue: WeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, modelValue.config);
            };
        }
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new MinimumSeparationDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerMinimumSeparationValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(MinimumSeparationDirective.$name, MinimumSeparationDirective.Factory());
