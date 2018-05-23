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
        let validators: ValidatorService[] = [
            this.maxTimeSlotValidatorService,
            this.monoScheduleValidatorService,
            this.nullEndScheduleValidatorService,
            this.fullCalendarValidatorService,
            this.overlapValidatorService
        ];

        let result: ValidationError[] = [];

        validators.forEach(validator => {
            if (!validator.validate(item.schedules, config)) {
                result.push(validator.error);
            }
        });

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ScheduleValidationService.$name, ScheduleValidationService);
