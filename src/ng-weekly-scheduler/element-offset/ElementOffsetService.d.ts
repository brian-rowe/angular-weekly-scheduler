/// <reference types="angular" />
/**
 * This helps reduce code duplication
 * This is used as a substitute for jQuery to keep dependencies minimal
 */
/** @internal */
export declare class ElementOffsetService {
    static $name: string;
    left($element: angular.IAugmentedJQuery): number;
    right($element: angular.IAugmentedJQuery): number;
}
