/** @internal */
class SecondsAsTextFilter {
    static $name = 'brWeeklySchedulerSecondsAsText';

    public static Factory() {
        return function(seconds: number): string {
            let result = ``;

            let hours = Math.floor(seconds / 3600);
            let hasHours = hours > 0;

            if (hasHours) {
                result += `${hours} hours`;
            }

            seconds -= hours * 3600;

            let min = Math.floor(seconds / 60);
            let hasMinutes = min > 0;

            if (hasMinutes) {
                if (hasHours) {
                    result += ' ';
                }

                result += `${min} minute${min > 1 ? 's' : ''}`;
            }

            seconds -= min * 60;

            if (seconds) {
                result += ` ${seconds} seconds`;    
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
    .filter(SecondsAsTextFilter.$name, [SecondsAsTextFilter.Factory]);
