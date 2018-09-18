/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
class WeeklySchedulerRange<T> implements br.weeklyScheduler.IWeeklySchedulerRange<T> {
    $class: string;
    $isActive: boolean;
    $isDeleting: boolean;
    $isEditing: boolean;

    day: br.weeklyScheduler.Days;
    start: number;
    end: number;
    value: T;

    constructor(
        schedule: br.weeklyScheduler.IWeeklySchedulerRange<T>
    ) {
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
    }

    get duration() {
        return this.end - this.start;
    }

    public equals(other: WeeklySchedulerRange<T>) {
        return angular.equals(this, other);
    }

    public hasSameValueAs(other: WeeklySchedulerRange<T>) {
        return this.value === other.value;
    }
}
