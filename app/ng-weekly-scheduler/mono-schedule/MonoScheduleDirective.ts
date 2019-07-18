import * as angular from 'angular';
import { MonoScheduleValidatorService } from '../schedule-validator/MonoScheduleValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
class MonoScheduleDirective implements angular.IDirective {
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

        directive.$inject = ['brWeeklySchedulerMonoScheduleValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(MonoScheduleDirective.$name, MonoScheduleDirective.Factory());

