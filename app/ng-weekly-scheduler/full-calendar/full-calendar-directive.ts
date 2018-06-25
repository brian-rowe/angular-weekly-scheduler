class FullCalendarDirective implements angular.IDirective {
    static $name = 'fullCalendar';

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        if (attrs.fullCalendar) {
            ngModelCtrl.$validators.fullCalendar = () => {
                return true;
            };
        } else {
            // do nothing
        }
    }

    require = 'ngModel';

    static Factory() {
        let directive = () => {
            return new FullCalendarDirective();
        };

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(FullCalendarDirective.$name, FullCalendarDirective.Factory());
