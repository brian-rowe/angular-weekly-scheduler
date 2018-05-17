class TimeRangeComponent implements angular.IComponentOptions {
    static $name = 'brTimeRange';

    bindings = {
        schedule: '<'
    }

    template = `{{ $ctrl.schedule.start | brWeeklySchedulerTimeOfDay }}-{{ $ctrl.schedule.end | brWeeklySchedulerTimeOfDay }}`
}

angular
    .module('br.weeklyScheduler')
    .component(TimeRangeComponent.$name, new TimeRangeComponent());
