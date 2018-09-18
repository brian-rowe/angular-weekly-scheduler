/** @internal */
class NullEndScheduleValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerNullEndValidatorService';

    get error() {
        return ValidationError.NullEnd;
    }

    validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (config.nullEnds) {
            return schedules.length <= 1 && schedules.every(schedule => schedule.end === null);
        } else {
            return schedules.every(schedule => schedule.end !== null);
        }
    }
}


angular
    .module('br.weeklyScheduler')
    .service(NullEndScheduleValidatorService.$name, NullEndScheduleValidatorService);
