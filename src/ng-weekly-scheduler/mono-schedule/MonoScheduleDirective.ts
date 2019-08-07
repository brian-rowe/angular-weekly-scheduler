import * as angular from 'angular';
import { MonoScheduleValidatorService } from '../schedule-validator/MonoScheduleValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
export class MonoScheduleDirective implements angular.IDirective {
    static $name = 'brMonoSchedule';

    constructor(
        private validator: MonoScheduleValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brMonoSchedule) {
            ngModelCtrl.$validators[this.validator.error] = (modelValue: WeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, modelValue.config);
            };
        }
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new MonoScheduleDirective(validator);
        };

        directive.$inject = [MonoScheduleValidatorService.$name];

        return directive;
    }
}
