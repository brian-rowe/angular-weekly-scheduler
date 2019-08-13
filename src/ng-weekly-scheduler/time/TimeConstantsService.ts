/** @internal */
export class TimeConstantsService {
    static $name = 'rrWeeklySchedulerTimeConstantsService';

    public get DAYS_IN_WEEK() {
        return 7;
    }

    public get SECONDS_IN_DAY() {
        return this.MINUTES_IN_DAY * this.SECONDS_IN_MINUTE; 
    }

    public get SECONDS_IN_HOUR() {
        return this.SECONDS_IN_MINUTE * this.MINUTES_IN_HOUR;
    }

    public get SECONDS_IN_MINUTE() {
        return 60;
    }

    public get HOURS_IN_DAY() {
        return 24;
    }

    public get MINUTES_IN_DAY() {
        return this.MINUTES_IN_HOUR * this.HOURS_IN_DAY;
    }

    public get MINUTES_IN_HOUR() {
        return 60;
    }
}
