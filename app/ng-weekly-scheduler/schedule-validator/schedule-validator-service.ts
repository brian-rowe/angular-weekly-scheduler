/** @internal */
class ScheduleValidatorService {
    static $name = 'scheduleValidatorService';

    static $inject = [
        'fullCalendarValidatorService',
        'maxTimeSlotValidatorService',
        'overlapValidatorService'
    ]

    private constructor(
        private fullCalendarValidatorService: FullCalendarValidatorService,
        private maxTimeSlotValidatorService: MaxTimeSlotValidatorService,
        private overlapValidatorService: OverlapValidatorService
    ) {
    }

    public areSchedulesValid(item: IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): boolean {
        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
            return false;
        }

        if (!this.fullCalendarValidatorService.validate(item.schedules, config)) {
            return false;
        }

        if (!this.overlapValidatorService.validate(item.schedules, config.maxValue)) {
            return false;
        }

        return true;
    }
}

angular
    .module('weeklyScheduler')
    .service(ScheduleValidatorService.$name, ScheduleValidatorService);
