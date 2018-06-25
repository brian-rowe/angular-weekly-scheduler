class FullCalendarDirective implements angular.IDirective {
    static $name = 'brFullCalendar';

    constructor(
        private validator: FullCalendarValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.brFullCalendar) {
            ngModelCtrl.$validators[ValidationError.FullCalendar] = (modelValue: WeeklySchedulerItem<any>) => {
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
            return new FullCalendarDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerFullCalendarValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(FullCalendarDirective.$name, FullCalendarDirective.Factory());
