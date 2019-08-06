import * as angular from 'angular';
export interface IResizeServiceProvider extends angular.IServiceProvider {
    setCustomResizeEvents(events: string[]): any;
}
