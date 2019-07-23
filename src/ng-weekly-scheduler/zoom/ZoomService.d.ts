/// <reference types="angular" />
/** @internal */
export declare class ZoomService {
    private $rootScope;
    static $name: string;
    static $inject: string[];
    private constructor();
    private selector;
    private broadcastZoomedInEvent();
    private broadcastZoomedOutEvent();
    private getCurrentZoomWidth(element);
    private getZoomElement(container);
    private setZoomWidth(element, width);
    resetZoom(element: any): void;
    zoomIn(element: any): void;
    zoomInACell(element: any, event: angular.IAngularEvent, data: any): void;
    zoomByScroll(element: any, event: WheelEvent, delta: number): void;
}
