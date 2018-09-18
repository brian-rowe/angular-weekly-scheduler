/** @internal */
class WeeklySchedulerRangeFactory {
    static $name = 'brWeeklySchedulerRangeFactory';

    public createRange(config: IWeeklySchedulerConfig<any>, schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
        return new WeeklySchedulerRange(schedule);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerRangeFactory.$name, WeeklySchedulerRangeFactory);
