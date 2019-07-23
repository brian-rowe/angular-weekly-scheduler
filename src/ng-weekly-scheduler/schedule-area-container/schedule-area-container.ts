import { ScrollService } from '../scroll/ScrollService';
import { ZoomService } from '../zoom/ZoomService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';

/** @internal */
export class ScheduleAreaContainerController implements angular.IComponentController {
    static $name = 'brWeeklySchedulerScheduleAreaContainerController';

    static $inject = [
        '$element',
        '$scope',
        'brWeeklySchedulerScrollService',
        'brWeeklySchedulerZoomService'
    ];

    constructor(
        private $element: angular.IAugmentedJQuery,
        private $scope: angular.IScope,
        private scrollService: ScrollService,
        private zoomService: ZoomService
    ) {
    }

    $postLink() {
        let element = this.$element[0]; // grab plain js, not jqlite

        this.scrollService.hijackScroll(element, 20);
        this.zoomService.resetZoom(element);


        this.$scope.$on(WeeklySchedulerEvents.CLICK_ON_A_CELL, (e, data) => {
            this.zoomService.zoomInACell(element, e, data);
        });

        this.$scope.$on(WeeklySchedulerEvents.RESET_ZOOM, (e) => {
            this.zoomService.resetZoom(element);
        });

        this.$scope.$on(WeeklySchedulerEvents.ZOOM_IN, (e) => {
            this.zoomService.zoomIn(element);
        });
    }
}

/** @internal */
export class ScheduleAreaContainerComponent implements angular.IComponentOptions {
    static $name = 'brScheduleAreaContainer';

    controller = ScheduleAreaContainerController.$name;
    transclude = true;

    template = `<ng-transclude></ng-transclude>`;
}
