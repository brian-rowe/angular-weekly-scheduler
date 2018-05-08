/** @internal */
class FullCalendarValidatorService {
    static $name = 'fullCalendarValidatorService';

    public validate(schedules: IWeeklySchedulerRange<any>[], fullCalendar: boolean) {
        if (!fullCalendar) {
            return true;
        }

        // When this option is true we should enforce that there are no gaps in the schedules

        // Compare two at a time until the end;
        let len = schedules.length - 1;
        let result = true;

        for (let i = 0; i < len; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];
            
            // Validate that the first item lands at 0
            if (i === 0 && current.start !== 0) {
                return false;
            }

            // Validate that the last item lands at maxValue
            if (i === len - 1 && next.end !== 1440) { // TODO
                return false;
            }

            result = result && current.end === next.start;
        }

        return result;
    }
}

angular
    .module('weeklyScheduler')
    .service(FullCalendarValidatorService.$name, FullCalendarValidatorService);
