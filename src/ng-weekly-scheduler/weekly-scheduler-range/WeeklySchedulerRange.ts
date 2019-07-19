import * as angular from 'angular';
import { Days } from '../weekly-scheduler-config/Days';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from './IWeeklySchedulerRange';


/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
export class WeeklySchedulerRange<T> implements IWeeklySchedulerRange<T> {
    $class: string;
    $isActive: boolean;
    $isDeleting: boolean;
    $isEditing: boolean;

    day: Days;
    start: number;
    end: number;
    value: T;

    editable: boolean;

    constructor(
        private config: IWeeklySchedulerConfig<T>,
        schedule: IWeeklySchedulerRange<T>,
        private endAdjusterService: EndAdjusterService
    ) {
        this.$class = schedule.$class;
        this.$isActive = schedule.$isActive;
        this.$isDeleting = schedule.$isDeleting;
        this.$isEditing = schedule.$isEditing;
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
        this.editable = angular.isDefined(schedule.editable) ? schedule.editable : true;
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

    public update(updatedSchedule: IWeeklySchedulerRange<T>) {
        let updatedStart = this.updateStart(updatedSchedule.start);
        let updatedEnd = this.updateEnd(updatedSchedule.end);

        if (updatedStart || updatedEnd) {
            this.config.onChange();
        }
    }

    public updateEnd(updatedEnd: number) {
        if (this.canUpdateEnd(updatedEnd)) {
            this.end = this.endAdjusterService.adjustEndForModel(this.config, updatedEnd);
            return true;
        }

        return false;
    }

    public updateStart(updatedStart: number) {
        if (this.canUpdateStart(updatedStart)) {
            this.start = updatedStart;
            return true;
        }

        return false;
    }

    private canUpdateEnd(updatedEnd: number) {
        let changed = this.end !== updatedEnd;
        let newEndBeforeOrAtMax = updatedEnd <= this.config.maxValue;
        let newEndAfterOrAtExistingStart = this.endAdjusterService.adjustEndForView(this.config, updatedEnd) >= this.start + 1;

        return changed && newEndBeforeOrAtMax && newEndAfterOrAtExistingStart;
    }

    private canUpdateStart(updatedStart: number) {
        let changed = this.start !== updatedStart;
        let newStartBeforeOrAtExistingEnd = updatedStart <= this.endAdjusterService.adjustEndForView(this.config, this.end) - 1;
        let newStartAfterOrAtMin = updatedStart >= 0;

        return changed && (this.config.nullEnds || newStartBeforeOrAtExistingEnd) && newStartAfterOrAtMin;
    }
}
