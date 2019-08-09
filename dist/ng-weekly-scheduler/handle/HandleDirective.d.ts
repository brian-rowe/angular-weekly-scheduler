/// <reference types="angular" />
import * as angular from 'angular';
import { HandleProviderFactory } from './HandleProviderFactory';
/** @internal */
export declare class HandleDirective implements angular.IDirective {
    private $document;
    private handleProviderFactory;
    static $name: string;
    restrict: string;
    scope: {
        config: string;
        ondrag: string;
        ondragstop: string;
        ondragstart: string;
        immediate: string;
    };
    link: (scope: any, element: angular.IAugmentedJQuery) => void;
    constructor($document: angular.IDocumentService, handleProviderFactory: HandleProviderFactory);
    static Factory(): ($document: any, handleProviderFactory: any) => HandleDirective;
}
