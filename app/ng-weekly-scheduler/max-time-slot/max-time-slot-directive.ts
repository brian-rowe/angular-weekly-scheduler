class MaxTimeSlotDirective implements angular.IDirective {
    static $name = 'brMaxTimeSlot';

    constructor(
        private validator: MaxTimeSlotValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brMaxTimeSlot) {
            ngModelCtrl.$validators[ValidationError.MaxTimeSlot] = (modelValue: WeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, modelValue.config);
            };

            scope.$watch(attrs.ngModel, () => {
                ngModelCtrl.$validate();
            }, true);
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

angular
    .module('br.weeklyScheduler')
    .directive(MaxTimeSlotDirective.$name, MaxTimeSlotDirective.Factory());

