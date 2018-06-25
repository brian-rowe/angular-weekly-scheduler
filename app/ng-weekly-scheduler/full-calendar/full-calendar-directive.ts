class FullCalendarDirective implements angular.IDirective {
    static $name = 'fullCalendar';

    constructor(
        private validator: FullCalendarValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.fullCalendar) {
            ngModelCtrl.$validators.fullCalendar = (modelValue: IInternalWeeklySchedulerItem<any>) => {
                return this.validator.validate(modelValue.schedules, (modelValue as any).config); // TODO
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
