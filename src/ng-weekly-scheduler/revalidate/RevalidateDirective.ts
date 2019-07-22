/**
 * Runs custom validators whenever the model changes
 */

/** @internal */
export class RevalidateDirective implements angular.IDirective {
    static $name = 'brRevalidate';

    link = (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModelCtrl: angular.INgModelController) => {
        scope.$watch(attrs.ngModel, () => {
            ngModelCtrl.$validate();
        }, true);
    }

    require = 'ngModel';

    static Factory() {
        let directive = () => {
            return new RevalidateDirective();
        };

        return directive;
    }
}
