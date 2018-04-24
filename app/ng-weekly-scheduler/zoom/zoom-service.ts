class ZoomService {
    static $name = 'zoomService';

    static $inject = ['$rootScope'];

    private constructor(
        private $rootScope: angular.IRootScopeService
    ) {
    }

    private selector: string = '.schedule-area';

    public resetZoom(element: any) {
        element.querySelector(this.selector).style.width = '100%';
        this.$rootScope.$broadcast(WeeklySchedulerEvents.ZOOMED_OUT);
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

        // leave (1/3) each side
        // 1/3 |    3/3   | 1/3
        let boxWidth = containerWidth / (5 / 3);
        let gutterSize = boxWidth / 3;

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

        this.$rootScope.$broadcast(WeeklySchedulerEvents.ZOOMED_IN);
    }
}

angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);
