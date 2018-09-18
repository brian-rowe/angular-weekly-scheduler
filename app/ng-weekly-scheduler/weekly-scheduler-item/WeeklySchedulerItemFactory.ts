/** @internal */
class WeeklySchedulerItemFactory {
    static $name = 'brWeeklySchedulerItemFactory';

    static $inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerFillEmptyWithDefaultService',
        'brWeeklySchedulerOverlapService',
        'brWeeklySchedulerPurgeDefaultService',
        'brWeeklySchedulerRangeFactory'
    ];

    private constructor(
        private dayMap: DayMap,
        private endAdjusterService: EndAdjusterService,
        private fillEmptyWithDefaultService: FillEmptyWithDefaultService,
        private overlapService: OverlapService,
        private purgeDefaultService: PurgeDefaultService,
        private rangeFactory: WeeklySchedulerRangeFactory
    ) {
    }

    public createItem(config: IWeeklySchedulerConfig<any>, day: number, schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[]) {
        let result: IInternalWeeklySchedulerItem<any>;

        let builder: br.weeklyScheduler.IWeeklySchedulerItem<any> = config.createItem(day, schedules);
    
        result = angular.extend(builder, { label: this.dayMap[day] });
    
        return new WeeklySchedulerItem(config, result, this.endAdjusterService, this.fillEmptyWithDefaultService, this.overlapService, this.purgeDefaultService, this.rangeFactory);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory);

