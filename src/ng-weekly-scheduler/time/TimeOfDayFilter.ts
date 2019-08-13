import { TimeConstantsService } from './TimeConstantsService';

/** @internal */
export class TimeOfDayFilter {
    static $name = 'rrWeeklySchedulerTimeOfDay';

    public static Factory() {
        let factoryFunction = (timeConstants: TimeConstantsService) => {
            return function(seconds: number): string {
                let hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);
                let meridiem = hours > 11 && hours < 24 ? 'P' : 'A';

                seconds -= hours * timeConstants.SECONDS_IN_HOUR;

                let minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);
                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;

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
        };

        factoryFunction.$inject = [TimeConstantsService.$name]

        return factoryFunction;
    }
}
