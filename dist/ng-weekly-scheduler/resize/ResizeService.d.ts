/// <reference types="angular" />
import * as angular from 'angular';
import { IResizeServiceProvider } from './IResizeServiceProvider';
import { IResizeService } from './IResizeService';
/** @internal */
export declare class ResizeServiceProvider implements IResizeServiceProvider {
    static $name: string;
    constructor();
    private customResizeEvents;
    private serviceInitialized;
    setCustomResizeEvents(events: string[]): void;
    $get($rootScope: angular.IRootScopeService, $window: angular.IWindowService): IResizeService;
}
