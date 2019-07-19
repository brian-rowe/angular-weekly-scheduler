import * as angular from 'angular';
import { FullCalendarValidatorService } from '../schedule-validator/FullCalendarValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
class FullCalendarDirective implements angular.IDirective {
    static $name = 'brFullCalendar';

    constructor(
        private validator: FullCalendarValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brFullCalendar) {
            ngModelCtrl.$validators[this.validator.error] = (modelValue: WeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, modelValue.config);
            };
        }
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new FullCalendarDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerFullCalendarValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(FullCalendarDirective.$name, FullCalendarDirective.Factory());
