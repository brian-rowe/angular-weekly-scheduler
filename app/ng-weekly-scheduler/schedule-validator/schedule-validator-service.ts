/** @internal */
class ScheduleValidationService {
    static $name = 'brWeeklySchedulerValidationService';

    static $inject = [
        'brWeeklySchedulerFullCalendarValidatorService',
        'brWeeklySchedulerMaxTimeSlotValidatorService',
        'brWeeklySchedulerMonoScheduleValidatorService',
        'brWeeklySchedulerNullEndValidatorService',
        'brWeeklySchedulerOverlapValidatorService'
    ]

    private constructor(
        private fullCalendarValidatorService: FullCalendarValidatorService,
        private maxTimeSlotValidatorService: MaxTimeSlotValidatorService,
        private monoScheduleValidatorService: MonoScheduleValidatorService,
        private nullEndScheduleValidatorService: NullEndScheduleValidatorService,
        private overlapValidatorService: OverlapValidatorService
    ) {
    }

    public getValidationErrors(item: IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): ValidationError[] {
        let result: ValidationError[] = [];

        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
            result.push(ValidationError.MaxTimeSlotViolation);
        }

        if (!this.monoScheduleValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.FullCalendarViolation);
        }

        if (!this.nullEndScheduleValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.NullEndViolation);
        }

        if (!this.fullCalendarValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.FullCalendarViolation);
        }

        if (!this.overlapValidatorService.validate(item.schedules, config.maxValue)) {
            result.push(ValidationError.OverlapViolation);
        }

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ScheduleValidationService.$name, ScheduleValidationService);
