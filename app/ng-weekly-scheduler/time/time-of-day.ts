/** @internal */
class TimeOfDayFilter {
    static $name = 'timeOfDay';

    public static Factory() {
        return function(minutes: number): string {
            let hours = Math.floor(minutes / 60);
            let remainingMinutes = (minutes - (hours * 60)).toString();
            let meridiem = hours > 11 ? 'P' : 'A';

            if (remainingMinutes.length == 1) {
                remainingMinutes = '0' + remainingMinutes;
            }

            return `${hours % 12 || 12}:${remainingMinutes}${meridiem}`;
        }
    }
}

angular
    .module('weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
