class ScheduleAreaContainerController implements angular.IComponentController {
    static $name = 'scheduleAreaContainerController';

    static $inject = [
        '$element',
        '$scope'
    ];

    constructor(
        private $element: angular.IAugmentedJQuery,
        private $scope: angular.IScope
    ) {
    }

    $postLink() {
        let element = this.$element[0]; // grab plain js, not jqlite

        mouseScroll(element, 20);

        this.$scope.$on(WeeklySchedulerEvents.CLICK_ON_A_CELL, (e, data) => {
            zoomInACell(element, e, data);
        });
    }
}

class ScheduleAreaContainerComponent implements angular.IComponentOptions {
    static $name = 'scheduleAreaContainer';

    controller = ScheduleAreaContainerController.$name;
    transclude = true;

    template = `<ng-transclude></ng-transclude>`;
}

angular.module('weeklyScheduler')
    .controller(ScheduleAreaContainerController.$name, ScheduleAreaContainerController)
    .component(ScheduleAreaContainerComponent.$name, new ScheduleAreaContainerComponent());
