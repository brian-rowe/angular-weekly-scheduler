/** @internal */
class OverlapValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerOverlapValidatorService';

    static $inject = [
        'brWeeklySchedulerOverlapService'
    ];
    
    private constructor(
        private overlapService: OverlapService
    ) {
    }

    get error() {
        return ValidationError.Overlap;
    }

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        // Compare two at a time until the end
        let len = schedules.length;
        let result = true;

        for (let i = 0; i < len - 1; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];

            let valuesMatch = current.value === next.value;

            if (!valuesMatch) {
                let overlapState = this.overlapService.getOverlapState(config, current, next);
                result = result && [OverlapState.NoOverlap, OverlapState.OtherStartIsCurrentEnd, OverlapState.OtherEndIsCurrentStart].indexOf(overlapState) > -1;
            }
        }

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(OverlapValidatorService.$name, OverlapValidatorService);
