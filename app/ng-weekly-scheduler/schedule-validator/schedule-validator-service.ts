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
        private fullCalendarValidatorService: ValidatorService,
        private maxTimeSlotValidatorService: ValidatorService,
        private monoScheduleValidatorService: ValidatorService,
        private nullEndScheduleValidatorService: ValidatorService,
        private overlapValidatorService: ValidatorService
    ) {
    }

    public getValidationErrors(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): ValidationError[] {
        let result: ValidationError[] = [];

        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.MaxTimeSlotViolation);
        }

        if (!this.monoScheduleValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.MonoScheduleViolation);
        }

        if (!this.nullEndScheduleValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.NullEndViolation);
        }

        if (!this.fullCalendarValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.FullCalendarViolation);
        }

        if (!this.overlapValidatorService.validate(item.schedules, config)) {
            result.push(ValidationError.OverlapViolation);
        }

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ScheduleValidationService.$name, ScheduleValidationService);
