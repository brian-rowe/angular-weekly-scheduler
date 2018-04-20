/** @internal */
class TimeOfDayFilter {
    static $name = 'timeOfDay';

    public static Factory() {
        const standardFormat: string = 'h:mmA';
        const militaryFormat: string = 'HH:mm';

        return function(minutes: number): string {
            // The moment-duration-format package always outputs military time, (it converts a duration to a time string, not a time of day) so we'll need to grab that and then convert
            let militaryTime = moment.duration(minutes, 'minutes').format(militaryFormat, { trim: false });

            return moment(militaryTime, militaryFormat).format(standardFormat);
        }
    }
}

angular
    .module('weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
