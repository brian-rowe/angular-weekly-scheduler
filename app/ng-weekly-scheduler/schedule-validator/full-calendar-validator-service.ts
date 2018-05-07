/** @internal */
class FullCalendarValidatorService {
    static $name = 'fullCalendarValidatorService';

    public validate(schedules: IWeeklySchedulerRange<any>[], fullCalendar: boolean) {
        if (!fullCalendar) {
            return true;
        }

        // When this option is true we should enforce that there are no gaps in the schedules

        // Compare two at a time until the end;
        let len = schedules.length;
        let result = true;

        for (let i = 0; i < len - 1; i++) {
            let current = schedules[i];
            let next = schedules[i + 1];

            result = result && current.end === next.start;
        }

        return result;
    }
}

angular
    .module('weeklyScheduler')
    .service(FullCalendarValidatorService.$name, FullCalendarValidatorService);
