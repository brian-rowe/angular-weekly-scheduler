namespace br.weeklyScheduler {
    export interface IWeeklySchedulerItem<T> {
        day: br.weeklyScheduler.Days;
        editable?: boolean;
        schedules: IWeeklySchedulerRange<T>[];
    }
}

/** Use this for properties you need access to but don't want exposed to clients */
/** @internal */
interface IInternalWeeklySchedulerItem<T> extends br.weeklyScheduler.IWeeklySchedulerItem<T> {
    label: string;
}

/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
class WeeklySchedulerItem<T> implements IInternalWeeklySchedulerItem<T> {
    day: br.weeklyScheduler.Days;
    editable: boolean;
    label: string;
    schedules: WeeklySchedulerRange<T>[];

    private overlapHandlers: { [key: number]: (current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>) => void; } = {
        [OverlapState.NoOverlap]: (current, other) => this.handleNoOverlap(current, other),
        [OverlapState.CurrentIsInsideOther]: (current, other) => this.handleCurrentIsInsideOther(current, other),
        [OverlapState.CurrentCoversOther]: (current, other) => this.handleCurrentCoversOther(current, other),
        [OverlapState.OtherEndIsInsideCurrent]: (current, other) => this.handleOtherEndIsInsideCurrent(current, other),
        [OverlapState.OtherStartIsInsideCurrent]: (current, other) => this.handleOtherStartIsInsideCurrent(current, other),
        [OverlapState.OtherEndIsCurrentStart]: (current, other) => this.handleOtherEndIsCurrentStart(current, other),
        [OverlapState.OtherStartIsCurrentEnd]: (current, other) => this.handleOtherStartIsCurrentEnd(current, other)
    };

    constructor(
        public config: IWeeklySchedulerConfig<T>,
        private item: IInternalWeeklySchedulerItem<T>,
        private endAdjusterService: EndAdjusterService,
        private overlapService: OverlapService
    ) {
        this.day = item.day;
        this.editable = item.editable;
        this.label = item.label;
        this.schedules = item.schedules.map(schedule => new WeeklySchedulerRange(schedule));
    }

    public addSchedule(schedule: WeeklySchedulerRange<T>) {
        this.schedules.push(schedule);
    }

    public hasNoSchedules() {
        return this.schedules.length === 0;
    }

    public isEditable() {
        return !angular.isDefined(this.editable) || this.editable;
    }

    public mergeOverlaps() {
        do {
            this.schedules.forEach(schedule => this.mergeOverlapsForSchedule(schedule));
        } while (this.needsOverlapsMerged());
    }

    public mergeSchedule(schedule: WeeklySchedulerRange<any>) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlapsForSchedule(schedule);
        this.mergeOverlaps();
    }

    public removeSchedule(schedule: WeeklySchedulerRange<T>) {
        let schedules = this.schedules;

        schedules.splice(schedules.indexOf(schedule), 1);

        this.config.onRemove();
    }

    public updateSchedule(schedule: WeeklySchedulerRange<T>, update: br.weeklyScheduler.IWeeklySchedulerRange<T>) {
        schedule.start = update.start;
        schedule.end = this.endAdjusterService.adjustEndForModel(this.config, update.end);

        this.config.onChange();
    }

    // Overlap handlers

    private handleCurrentCoversOther(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        this.removeSchedule(other);
    }

    private handleCurrentIsInsideOther(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeSchedule(other);

            this.updateSchedule(current, {
                day: other.day,
                start: other.start,
                end: other.end,
                value: other.value
            });
        } else {
            // Just remove 'current'
            this.removeSchedule(current);
        }
    }

    private handleNoOverlap(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
        // Do nothing
    }

    private handleOtherEndIsInsideCurrent(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);

            this.updateSchedule(current, {
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        } else {
            this.updateSchedule(other, {
                day: other.day,
                start: other.start,
                end: current.start,
                value: current.value
            });
        }
    }

    private handleOtherStartIsInsideCurrent(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);

            this.updateSchedule(current, {
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        } else {
            this.updateSchedule(other, {
                day: other.day,
                start: current.end,
                end: other.end,
                value: other.value
            })
        }
    }

    private handleOtherEndIsCurrentStart(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            this.handleOtherEndIsInsideCurrent(current, other);
        } else {
            // DO NOTHING, this is okay if the values don't match
        }
    }

    private handleOtherStartIsCurrentEnd(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            this.handleOtherStartIsInsideCurrent(current, other);
        } else {
            // DO NOTHING, this is okay if the values don't match
        }
    }

    // End overlap handlers

    private mergeOverlapsForSchedule(schedule: WeeklySchedulerRange<any>) {
        let schedules = this.schedules;

        schedules.forEach(el => {
            if (el !== schedule) {
                let overlapState = this.overlapService.getOverlapState(this.config, schedule, el);
                let overlapHandler = this.overlapHandlers[overlapState];

                overlapHandler(schedule, el);
            }
        });
    }

    private needsOverlapsMerged() {
        let len = this.schedules.length;

        // Compare two at a time
        for (let i = 0; i < len - 1; i += 1) {
            let current = this.schedules[i];
            let next = this.schedules[i + 1];

            if (current.hasSameValueAs(next)) {
                let overlapState = this.overlapService.getOverlapState(this.config, current, next);

                return [OverlapState.OtherEndIsCurrentStart, OverlapState.OtherStartIsCurrentEnd].indexOf(overlapState) > -1;
            }
        }
    }
}
