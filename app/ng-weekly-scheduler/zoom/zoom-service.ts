/** @internal */
class ZoomService {
    static $name = 'zoomService';

    static $inject = ['$rootScope'];

    private constructor(
        private $rootScope: angular.IRootScopeService
    ) {
    }

    private selector: string = '.schedule-area';

    private broadcastZoomedInEvent() {
        this.$rootScope.$broadcast(WeeklySchedulerEvents.ZOOMED_IN);
    }

    private broadcastZoomedOutEvent() {
        this.$rootScope.$broadcast(WeeklySchedulerEvents.ZOOMED_OUT);
    }

    private getCurrentZoomWidth(element: any): number {
        return parseInt(element.querySelector(this.selector).style.width, 10);
    }

    private setZoomWidth(element: any, width: string): void {
        element.querySelector(this.selector).style.width = width;
    }

    public resetZoom(element: any) {
        this.setZoomWidth(element, '100%');
        this.broadcastZoomedOutEvent();
    }

    public zoomInACell(element: any, event: angular.IAngularEvent, data: any) {
        let elementCount = data.nbElements;
        let i = data.idx;

        // percentWidthFromBeginning is used when the first element of the grid is not full
        // For instance, in the example below `feb 17` is not full
        // feb 17          march 17
        //       |    
        let percentWidthFromBeginning = data.percentWidthFromBeginning;

        let containerWidth = element.offsetWidth;

        let boxesToDisplay = 5;
        let boxWidth = containerWidth / boxesToDisplay;

        let boxesToSkip = 2;
        let gutterSize = boxWidth * boxesToSkip;

        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;

        this.setZoomWidth(element, scheduleAreaWidthPercent + '%');

        if (percentWidthFromBeginning === undefined) {
          // All cells of a line have the same size
          element.scrollLeft = i * boxWidth - gutterSize;
        } else {
          // Sizes of cells in a line could different (especially the first one)
          element.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
        }

        this.broadcastZoomedInEvent();
    }

    public zoomByScroll(element: any, event: WheelEvent, delta: number) {
        let currentWidth = this.getCurrentZoomWidth(element);

        if ((event.wheelDelta || event.detail) > 0) {
            this.setZoomWidth(element, (currentWidth + 2 * delta) + '%');
            this.broadcastZoomedInEvent();
        } else {
            let width = currentWidth - 2 * delta;
            this.setZoomWidth(element, (width > 100 ? width : 100) + '%');
            this.broadcastZoomedOutEvent();
        }
    }
}

angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);
