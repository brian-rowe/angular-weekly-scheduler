/** @internal */
class ScheduleValidationService {
    static $name = 'brWeeklySchedulerValidationService';

    static $inject = [
        'brWeeklySchedulerMaxTimeSlotValidatorService',
        'brWeeklySchedulerNullEndValidatorService',
        'brWeeklySchedulerOverlapValidatorService'
    ]

    private constructor(
        private maxTimeSlotValidatorService: ValidatorService,
        private nullEndScheduleValidatorService: ValidatorService,
        private overlapValidatorService: ValidatorService
    ) {
    }

    public getValidationErrors(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): ValidationError[] {
        let validators: ValidatorService[] = [
            this.maxTimeSlotValidatorService,
            this.nullEndScheduleValidatorService,
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
