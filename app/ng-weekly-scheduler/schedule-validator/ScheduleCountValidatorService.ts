/** @internal */
class ScheduleCountValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerScheduleCountValidatorService';

    get error() {
        return ValidationError.ScheduleCount;
    }

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.scheduleCountOptions.count) {
            return true;    
        }

        if (config.scheduleCountOptions.exact) {
            return this.validateExactCount(schedules, config);
        } else {
            return this.validateMaxCount(schedules, config);
        }
    }

    private validateExactCount(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        return schedules.length === config.scheduleCountOptions.count;
    }

    private validateMaxCount(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        return schedules.length <= config.scheduleCountOptions.count;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ScheduleCountValidatorService.$name, ScheduleCountValidatorService);
