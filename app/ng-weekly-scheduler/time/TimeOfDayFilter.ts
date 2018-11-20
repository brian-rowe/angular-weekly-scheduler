/** @internal */
class TimeOfDayFilter {
    static $name = 'brWeeklySchedulerTimeOfDay';

    public static Factory() {
        return function(seconds: number): string {
            let hours = Math.floor(seconds / 3600);
            let meridiem = hours > 11 && hours < 24 ? 'P' : 'A';

            seconds -= hours * 3600;

            let minutes = Math.floor(seconds / 60);
            seconds -= minutes * 60;

            let remainingMinutes = minutes.toString()

            if (remainingMinutes.length == 1) {
                remainingMinutes = '0' + remainingMinutes;
            }

            let displayHours = hours % 12 || 12;

            if (!seconds) {
                return `${displayHours}:${remainingMinutes}${meridiem}`;
            } else {
                return `${displayHours}:${remainingMinutes}:${seconds}${meridiem}`;
            }
        }
    }
}

angular
    .module('br.weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
