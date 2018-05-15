/** @internal */
class ScheduleValidationService {
    static $name = 'brWeeklySchedulerValidationService';

    static $inject = [
        'brWeeklySchedulerFullCalendarValidatorService',
        'brWeeklySchedulerMaxTimeSlotValidatorService',
        'brWeeklySchedulerMonoScheduleValidatorService',
        'brWeeklySchedulerOverlapValidatorService'
    ]

    private constructor(
        private fullCalendarValidatorService: FullCalendarValidatorService,
        private maxTimeSlotValidatorService: MaxTimeSlotValidatorService,
        private monoScheduleValidatorService: MonoScheduleValidatorService,
        private overlapValidatorService: OverlapValidatorService
    ) {
    }

    public areSchedulesValid(item: IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): boolean {
        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
            return false;
        }

        if (!this.monoScheduleValidatorService.validate(item.schedules, config)) {
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
    .module('br.weeklyScheduler')
    .service(ScheduleValidationService.$name, ScheduleValidationService);
