import { TimeConstantsService } from './TimeConstantsService';

/** @internal */
export class SecondsAsTextFilter {
    static $name = 'rrWeeklySchedulerSecondsAsText';

    public static Factory() {
        let factoryFunction = (timeConstants: TimeConstantsService) => {
            return function(seconds: number): string {
                let result = ``;

                let hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);

                result = SecondsAsTextFilter.addHoursToResult(result, hours);

                seconds -= hours * timeConstants.SECONDS_IN_HOUR;

                let minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);

                result = SecondsAsTextFilter.addMinutesToResult(result, minutes);

                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;

                result = SecondsAsTextFilter.addSecondsToResult(result, seconds);

                if (!result) {
                    result = 'none';
                }

                return result;
            }
        };

        factoryFunction.$inject = [TimeConstantsService.$name];

        return factoryFunction;
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

            result += `${seconds} second${seconds > 1 ? 's' : ''}`;
        }

        return result;
    }
}
