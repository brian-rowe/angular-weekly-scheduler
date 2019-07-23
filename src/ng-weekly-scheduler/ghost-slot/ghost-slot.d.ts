/// <reference types="angular" />
/** @internal */
export declare class GhostSlotController implements angular.IComponentController {
    private $element;
    static $name: string;
    static $controllerAs: string;
    static $inject: string[];
    constructor($element: angular.IAugmentedJQuery);
    private multiSliderCtrl;
}
/** @internal */
export declare class GhostSlotComponent implements angular.IComponentOptions {
    static $name: string;
    controller: string;
    controllerAs: string;
    require: {
        multiSliderCtrl: string;
    };
    template: string;
    transclude: boolean;
}
