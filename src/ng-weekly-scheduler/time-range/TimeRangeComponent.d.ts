import * as angular from 'angular';
/** @internal */
export declare class TimeRangeComponent implements angular.IComponentOptions {
    static $name: string;
    bindings: {
        schedule: string;
    };
    controller: string;
    controllerAs: string;
    template: string;
}
/** @internal */
export declare class TimeRangeController implements angular.IComponentController {
    static $controllerAs: string;
    static $name: string;
    private hasStart;
    private hasEnd;
    private schedule;
    $onInit(): void;
}
