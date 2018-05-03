/** @internal */
class ScheduleValidatorService {
    static $name = 'scheduleValidatorService';

    static $inject = ['overlapService']

    private constructor(
        private overlapService: OverlapService
    ) {
    }

    public areSchedulesValid(item: IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig): boolean {
        let len = item.schedules.length;

        let result = true;

        if (len) {
            // Compare two at a time until the end
            for (let i = 0; i < len - 1; i++) {
                let currentSchedule = item.schedules[i];
                let nextSchedule = item.schedules[i + 1];

                let valuesMatch: boolean = currentSchedule.value === nextSchedule.value;
                let overlapState = this.overlapService.getOverlapState(currentSchedule.start, currentSchedule.end || config.maxValue, nextSchedule.start, nextSchedule.end || config.maxValue);

                if (!valuesMatch) {
                    result = [OverlapState.NoOverlap, OverlapState.OtherStartIsCurrentEnd, OverlapState.OtherEndIsCurrentStart].indexOf(overlapState) > -1;
                }
            }
        }

        return result;
    }
}

angular
    .module('weeklyScheduler')
    .service(ScheduleValidatorService.$name, ScheduleValidatorService);
