/** @internal */
class WeeklySchedulerItemFactory {
    static $name = 'brWeeklySchedulerItemFactory';

    static $inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerOverlapService'
    ];

    private constructor(
        private dayMap: DayMap,
        private endAdjusterService: EndAdjusterService,
        private overlapService: OverlapService
    ) {
    }

    public createItem(config: IWeeklySchedulerConfig<any>, day: number, schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[]) {
        let result: IInternalWeeklySchedulerItem<any>;

        let builder: br.weeklyScheduler.IWeeklySchedulerItem<any> = config.createItem(day, schedules);
    
        result = angular.extend(builder, { label: this.dayMap[day] });
    
        return new WeeklySchedulerItem(config, result, this.endAdjusterService, this.overlapService);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory);

