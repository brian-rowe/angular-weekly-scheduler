/** @internal */
class MaxTimeSlotValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerMaxTimeSlotValidatorService';

    get error() {
        return ValidationError.MaxTimeSlot;
    }

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        let maxTimeSlot = config.maxTimeSlot;

        if (!maxTimeSlot) {
            return true;
        }

        return !schedules.some(s => s.value !== config.defaultValue && s.end - s.start > maxTimeSlot);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
