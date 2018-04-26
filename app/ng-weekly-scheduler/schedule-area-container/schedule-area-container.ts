/** @internal */
class ScheduleAreaContainerController implements angular.IComponentController {
    static $name = 'scheduleAreaContainerController';

    static $inject = [
        '$element',
        '$scope',
        'scrollService',
        'zoomService'
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

        this.$scope.$on(WeeklySchedulerEvents.CLICK_ON_A_CELL, (e, data) => {
            this.zoomService.zoomInACell(element, e, data);
        });
    }
}

/** @internal */
class ScheduleAreaContainerComponent implements angular.IComponentOptions {
    static $name = 'scheduleAreaContainer';

    controller = ScheduleAreaContainerController.$name;
    transclude = true;

    template = `<ng-transclude></ng-transclude>`;
}

angular.module('weeklyScheduler')
    .controller(ScheduleAreaContainerController.$name, ScheduleAreaContainerController)
    .component(ScheduleAreaContainerComponent.$name, new ScheduleAreaContainerComponent());
