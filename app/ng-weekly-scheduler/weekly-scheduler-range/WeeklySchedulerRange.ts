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
        private config: IWeeklySchedulerConfig<T>,
        schedule: br.weeklyScheduler.IWeeklySchedulerRange<T>,
        private endAdjusterService: EndAdjusterService
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

    public updateEnd(updatedEnd: number) {
        if (this.canUpdateEnd(updatedEnd)) {
            this.end = this.endAdjusterService.adjustEndForModel(this.config, updatedEnd);
            this.config.onChange();
        }
    }

    public updateStart(updatedStart: number) {
        if (this.canUpdateStart(updatedStart)) {
            this.start = updatedStart;
            this.config.onChange();
        }
    }

    private canUpdateEnd(updatedEnd: number) {
        let changed = this.end !== updatedEnd;
        let newEndBeforeOrAtMax = updatedEnd <= this.config.maxValue;
        let newEndAfterOrAtExistingStart = updatedEnd >= this.start + 1;

        return changed && newEndBeforeOrAtMax && newEndAfterOrAtExistingStart;
    }

    private canUpdateStart(updatedStart: number) {
        let changed = this.start !== updatedStart;
        let newStartBeforeOrAtExistingEnd = updatedStart <= this.endAdjusterService.adjustEndForView(this.config, this.end) - 1;
        let newStartAfterOrAtMin = updatedStart >= 0;

        return changed && newStartBeforeOrAtExistingEnd && newStartAfterOrAtMin;
    }
}
