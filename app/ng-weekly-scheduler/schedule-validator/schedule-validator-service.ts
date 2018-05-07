/** @internal */
class ScheduleValidatorService {
    static $name = 'scheduleValidatorService';

    static $inject = [
        'maxTimeSlotValidatorService',
        'overlapService'
    ]

    private constructor(
        private maxTimeSlotValidatorService: MaxTimeSlotValidatorService,
        private overlapService: OverlapService
    ) {
    }

    public areSchedulesValid(item: IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig): boolean {
        let len = item.schedules.length;

        let result = true;

        if (len) {
            if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
                return false;
            }

            // Compare two at a time until the end
            for (let i = 0; i < len - 1; i++) {
                let currentSchedule = item.schedules[i];
                let nextSchedule = item.schedules[i + 1];

                let valuesMatch: boolean = currentSchedule.value === nextSchedule.value;
                let overlapState = this.overlapService.getOverlapState(currentSchedule.start, currentSchedule.end || config.maxValue, nextSchedule.start, nextSchedule.end || config.maxValue);

                if (!valuesMatch) {
                    result = result && [OverlapState.NoOverlap, OverlapState.OtherStartIsCurrentEnd, OverlapState.OtherEndIsCurrentStart].indexOf(overlapState) > -1;
                }

                // When this option is true we should enforce that there are no gaps in the schedules
                if (config.fullCalendar) {
                    result = result && nextSchedule.start === currentSchedule.end;
                }
            }
        }

        return result;
    }
}

angular
    .module('weeklyScheduler')
    .service(ScheduleValidatorService.$name, ScheduleValidatorService);
