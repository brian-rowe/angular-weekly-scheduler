/** @internal */
class TimeOfDayFilter {
    static $name = 'brWeeklySchedulerTimeOfDay';

    public static Factory() {
        return function(minutes: number): string {
            let hours = Math.floor(minutes / 60);
            let remainingMinutes = (minutes - (hours * 60)).toString();
            let meridiem = hours > 11 && hours < 24 ? 'P' : 'A';

            if (remainingMinutes.length == 1) {
                remainingMinutes = '0' + remainingMinutes;
            }

            let displayHours = hours % 12 || 12;

            return `${displayHours}:${remainingMinutes}${meridiem}`;
        }
    }
}

angular
    .module('br.weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
