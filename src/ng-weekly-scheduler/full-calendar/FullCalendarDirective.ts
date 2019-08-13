import * as angular from 'angular';
import { FullCalendarValidatorService } from '../schedule-validator/FullCalendarValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
export class FullCalendarDirective implements angular.IDirective {
    static $name = 'rrFullCalendar';

    constructor(
        private validator: FullCalendarValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.rrFullCalendar) {
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

        directive.$inject = [FullCalendarValidatorService.$name];

        return directive;
    }
}
