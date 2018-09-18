/**
 * This helps reduce code duplication
 * This is used as a substitute for jQuery to keep dependencies minimal
 */

/** @internal */
class ElementOffsetService {
    static $name = 'brWeeklySchedulerElementOffsetService';

    public left($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().left;
    }

    public right($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().right;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ElementOffsetService.$name, ElementOffsetService);
