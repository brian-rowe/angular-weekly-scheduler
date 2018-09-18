/** @internal */
class MaxTimeSlotValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerMaxTimeSlotValidatorService';

    static $inject = ['brWeeklySchedulerEndAdjusterService'];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    get error() {
        return ValidationError.MaxTimeSlot;
    }

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        let maxTimeSlot = config.maxTimeSlot;

        if (!maxTimeSlot) {
            return true;
        }

        return !schedules.some(s => s.value !== config.defaultValue && this.endAdjusterService.adjustEndForView(config, s.end) - s.start > maxTimeSlot);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
