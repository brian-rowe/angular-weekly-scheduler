/** @internal */
class OverlapValidatorService {
    static $name = 'overlapValidatorService';

    static $inject = [
        'overlapService'
    ];
    
    private constructor(
        private overlapService: OverlapService
    ) {
    }

    public validate(schedules: IWeeklySchedulerRange<any>[], maxValue: number): boolean {
        // Compare two at a time until the end
        let len = schedules.length;
        let result = true;

        for (let i = 0; i < len - 1; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];

            let valuesMatch = current.value === next.value;

            if (!valuesMatch) {
                let overlapState = this.overlapService.getOverlapState(current.start, current.end || maxValue, next.start, next.end || maxValue);
                result = result && [OverlapState.NoOverlap, OverlapState.OtherStartIsCurrentEnd, OverlapState.OtherEndIsCurrentStart].indexOf(overlapState) > -1;
            }
        }

        return result;
    }
}

angular
    .module('weeklyScheduler')
    .service(OverlapValidatorService.$name, OverlapValidatorService);