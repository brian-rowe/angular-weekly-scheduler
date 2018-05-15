/** @internal */
class FullCalendarValidatorService {
    static $name = 'fullCalendarValidatorService';

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.fullCalendar) {
            return true;
        }

        
        // When this option is true we should enforce that there are no gaps in the schedules
        let len = schedules.length;

        // If there are no schedules, it automatically fails.
        if (!len) {
            return false;
        }
        
        // If there was only one item we should check that it spans the whole range
        if (len === 1) {
            let schedule = schedules[0];
            return this.validateStartAtMinValue(schedule.start) && this.validateEndAtMaxValue(schedule.end, config);
        }

        // If more, compare two at a time until the end
        let loopLen = len - 1;
        let result = true;

        for (let i = 0; i < loopLen; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];
            
            // Validate that the first item lands at 0
            if (i === 0 && !this.validateStartAtMinValue(current.start)) {
                return false;
            }

            // Validate that the last item lands at maxValue
            if (i === loopLen - 1 && !this.validateEndAtMaxValue(next.end, config)) {
                return false;
            }

            result = result && current.end === next.start;
        }

        return result;
    }

    private validateStartAtMinValue(start: number) {
        return start === 0;
    }

    private validateEndAtMaxValue(end: number, config: IWeeklySchedulerConfig<any>) {
        return (end || config.maxValue) === config.maxValue;
    }
}

angular
    .module('weeklyScheduler')
    .service(FullCalendarValidatorService.$name, FullCalendarValidatorService);
