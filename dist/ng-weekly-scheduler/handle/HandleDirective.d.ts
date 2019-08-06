/// <reference types="angular" />
import * as angular from 'angular';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';
/** @internal */
export declare class HandleDirective implements angular.IDirective {
    private $document;
    private mouseTrackerService;
    private touchService;
    static $name: string;
    restrict: string;
    scope: {
        ondrag: string;
        ondragstop: string;
        ondragstart: string;
        immediate: string;
    };
    link: (scope: any, element: angular.IAugmentedJQuery) => void;
    constructor($document: angular.IDocumentService, mouseTrackerService: MouseTrackerService, touchService: TouchService);
    static Factory(): ($document: any, mouseTrackerService: any, touchService: any) => HandleDirective;
}
