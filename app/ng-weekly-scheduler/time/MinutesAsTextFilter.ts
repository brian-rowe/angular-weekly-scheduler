/** @internal */
class MinutesAsTextFilter {
    static $name = 'brWeeklySchedulerMinutesAsText';

    public static Factory() {
        return function(minutes: number): string {
            let result = ``;

            let hours = Math.floor(minutes / 60);
            let hasHours = hours > 0;

            if (hasHours) {
                result += `${hours} hours`;
            }

            let min = minutes % 60;
            let hasMinutes = min > 0;

            if (hasMinutes) {
                if (hasHours) {
                    result += ' ';
                }

                result += `${min} minute${min > 1 ? 's' : ''}`;
            }

            if (!result) {
                result = 'none';
            }

            return result;
        }
    }
}

angular
    .module('br.weeklyScheduler')
    .filter(MinutesAsTextFilter.$name, [MinutesAsTextFilter.Factory]);
