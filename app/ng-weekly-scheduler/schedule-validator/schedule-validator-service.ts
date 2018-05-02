/** @internal */
class ScheduleValidatorService {
    static $name = 'scheduleValidatorService';

    static $inject = ['overlapService']

    private constructor(
        private overlapService: OverlapService
    ) {
    }

    public areSchedulesValid(item: IWeeklySchedulerItem<any>): boolean {
        let len = item.schedules.length;

        if (len) {
            // Compare two at a time until the end
            for (let i = 0; i < len - 1; i++) {
                let currentSchedule = item.schedules[i];
                let nextSchedule = item.schedules[i + 1];

                let valuesMatch: boolean = currentSchedule.value === nextSchedule.value;

                if (!valuesMatch && this.overlapService.getOverlapState(currentSchedule.start, currentSchedule.end || 1440, nextSchedule.start, nextSchedule.end || 1440) !== OverlapState.NoOverlap) { // TODO FIX HARDCODING
                    return false;
                }
            }

            return true;
        }
    }
}

angular
    .module('weeklyScheduler')
    .service(ScheduleValidatorService.$name, ScheduleValidatorService);
