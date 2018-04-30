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

    public resetZoom(element: any) {
        element.querySelector(this.selector).style.width = '100%';
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

        // Leave enough room for n full boxes
        let boxWidth = containerWidth / 5;

        // Scroll over n full boxes
        let gutterSize = boxWidth * 2;

        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;

        element.querySelector(this.selector).style.width = scheduleAreaWidthPercent + '%';

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
        let style = element.querySelector(this.selector).style;
        let currentWidth = parseInt(style.width, 10);

        if ((event.wheelDelta || event.detail) > 0) {
            style.width = (currentWidth + 2 * delta) + '%';

            this.broadcastZoomedInEvent();
        } else {
            let width = currentWidth - 2 * delta;
            style.width = (width > 100 ? width : 100) + '%';

            this.broadcastZoomedOutEvent();
        }
    }
}

angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);
