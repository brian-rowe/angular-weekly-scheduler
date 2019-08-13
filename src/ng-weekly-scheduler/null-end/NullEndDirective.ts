import * as angular from 'angular';
import { NullEndScheduleValidatorService } from '../schedule-validator/NullEndValidatorService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
export class NullEndDirective implements angular.IDirective {
    static $name = 'rrNullEnd';

    constructor(
        private validator: NullEndScheduleValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        ngModelCtrl.$validators[this.validator.error] = (modelValue: WeeklySchedulerItem<any>) => {
            return this.validator.validate(modelValue.schedules, modelValue.config);
        };
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new NullEndDirective(validator);
        };

        directive.$inject = [NullEndScheduleValidatorService.$name];

        return directive;
    }
}
