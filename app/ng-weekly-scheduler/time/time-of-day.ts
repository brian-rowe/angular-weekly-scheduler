class TimeOfDayFilter {
    static $name = 'timeOfDay';

    public static Factory() {
        return function(minutes: number): string {
            return minutes.toString();
        }
    }
}

angular
    .module('weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
