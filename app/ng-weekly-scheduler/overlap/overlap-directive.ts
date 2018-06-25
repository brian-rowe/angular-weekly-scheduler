/** @internal */
class OverlapDirective implements angular.IDirective {
    static $name = 'brOverlap';

    constructor(
        private validator: OverlapValidatorService
    ) {
    }

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        ngModelCtrl.$validators[ValidationError.Overlap] = (modelValue: WeeklySchedulerItem<any>) => {
            return this.validator.validate(modelValue.schedules, modelValue.config);
        };

        scope.$watch(attrs.ngModel, () => {
            ngModelCtrl.$validate();
        }, true);
    }

    require = 'ngModel';

    static Factory() {
        let directive = (validator) => {
            return new OverlapDirective(validator);
        };

        directive.$inject = ['brWeeklySchedulerOverlapValidatorService'];

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(OverlapDirective.$name, OverlapDirective.Factory());

