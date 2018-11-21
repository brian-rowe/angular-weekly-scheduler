/** @internal */
class SecondsAsTextFilter {
    static $name = 'brWeeklySchedulerSecondsAsText';

    public static Factory() {
        return function(seconds: number): string {
            let result = ``;

            let hours = Math.floor(seconds / 3600);

            result = SecondsAsTextFilter.addHoursToResult(result, hours);

            seconds -= hours * 3600;

            let minutes = Math.floor(seconds / 60);

            result = SecondsAsTextFilter.addMinutesToResult(result, minutes);

            seconds -= minutes * 60;

            result = SecondsAsTextFilter.addSecondsToResult(result, seconds);

            if (!result) {
                result = 'none';
            }

            return result;
        }
    }

    private static addHoursToResult(result: string, hours: number) {
        if (hours) {
            result += `${hours} hours`;
        }

        return result;
    }

    private static addMinutesToResult(result: string, minutes: number) {
        if (minutes) {
            if (result) {
                result += ` `;
            }

            result += `${minutes} minute${minutes > 1 ? 's' : ''}`; 
        }

        return result;
    }

    private static addSecondsToResult(result: string, seconds: number) {
        if (seconds) {
            if (result) {
                result += ` `;
            }

            result += `${seconds} seconds`;
        }

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .filter(SecondsAsTextFilter.$name, [SecondsAsTextFilter.Factory]);
