/** @internal */
class MaxTimeSlotValidatorService {
    static $name = 'maxTimeSlotValidatorService';

    public validate(schedules: IWeeklySchedulerRange<any>[], maxTimeSlot: number): boolean {
        if (!maxTimeSlot) {
            return true;
        }

        return !schedules.some(s => s.end - s.start > maxTimeSlot);
    }
}

angular
    .module('weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
