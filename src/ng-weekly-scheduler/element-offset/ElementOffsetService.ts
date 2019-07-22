/**
 * This helps reduce code duplication
 * This is used as a substitute for jQuery to keep dependencies minimal
 */

/** @internal */
export class ElementOffsetService {
    static $name = 'brWeeklySchedulerElementOffsetService';

    public left($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().left;
    }

    public right($element: angular.IAugmentedJQuery) {
        return $element[0].getBoundingClientRect().right;
    }
}
