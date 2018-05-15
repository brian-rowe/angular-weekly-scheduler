/** @internal */
class MonoScheduleValidatorService {
    static $name = 'brWeeklySchedulerMonoScheduleValidatorService';

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.monoSchedule) {
            return true;
        }

        // only allowed empty or 1 schedule per item
        return !schedules.length || schedules.length === 1;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MonoScheduleValidatorService.$name, MonoScheduleValidatorService);
