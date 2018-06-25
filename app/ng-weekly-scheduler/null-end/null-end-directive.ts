class NullEndDirective implements angular.IDirective {
    static $name = 'brNullEnd';

    constructor(
        private validator: NullEndScheduleValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        ngModelCtrl.$validators[ValidationError.NullEnd] = (modelValue: WeeklySchedulerItem<any>) => {
            return this.validator.validate(modelValue.schedules, modelValue.config);
        };

        scope.$watch(attrs.ngModel, () => {
            ngModelCtrl.$validate();
        }, true);
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new NullEndDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerNullEndValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(NullEndDirective.$name, NullEndDirective.Factory());

