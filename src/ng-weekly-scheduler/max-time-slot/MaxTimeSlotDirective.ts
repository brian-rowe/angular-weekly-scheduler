import * as angular from 'angular';
import { MaxTimeSlotValidatorService } from '../schedule-validator/MaxTimeSlotValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
export class MaxTimeSlotDirective implements angular.IDirective {
    static $name = 'brMaxTimeSlot';

    constructor(
        private validator: MaxTimeSlotValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brMaxTimeSlot) {
            ngModelCtrl.$validators[this.validator.error] = (modelValue: WeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, modelValue.config);
            };
        }
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new MaxTimeSlotDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerMaxTimeSlotValidatorService'];

        return directive;
    }
}
