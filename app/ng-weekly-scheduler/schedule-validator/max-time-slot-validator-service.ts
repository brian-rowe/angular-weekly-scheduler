/** @internal */
class MaxTimeSlotValidatorService {
    static $name = 'brWeeklySchedulerMaxTimeSlotValidatorService';

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], maxTimeSlot: number): boolean {
        if (!maxTimeSlot) {
            return true;
        }

        return !schedules.some(s => s.end - s.start > maxTimeSlot);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
