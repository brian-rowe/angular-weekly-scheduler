/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
class WeeklySchedulerItem<T> implements IInternalWeeklySchedulerItem<T> {
    $renderGhost: boolean;
    day: br.weeklyScheduler.Days;
    editable: boolean;
    label: string;
    schedules: WeeklySchedulerRange<T>[];

    constructor(
        public config: IWeeklySchedulerConfig<T>,
        item: IInternalWeeklySchedulerItem<T>,
        private fillEmptyWithDefaultService: FillEmptyWithDefaultService,
        private overlapService: OverlapService,
        private purgeDefaultService: PurgeDefaultService,
        rangeFactory: WeeklySchedulerRangeFactory
    ) {
        this.day = item.day;
        this.editable = item.editable;
        this.label = item.label;
        this.schedules = item.schedules.map(schedule => rangeFactory.createRange(config, schedule));
    }

    public addSchedule(schedule: WeeklySchedulerRange<T>) {
        this.schedules.push(schedule);
    }

    public canAddSchedule() {
        if (this.config.nullEnds) {
            return this.hasNoSchedules();
        } else {
            return true;
        }
    }

    public hasSchedule(schedule: WeeklySchedulerRange<T>) {
        return this.schedules.indexOf(schedule) > -1;
    }

    public hasNoSchedules() {
        return this.schedules.length === 0;
    }

    public isEditable() {
        return !angular.isDefined(this.editable) || this.editable;
    }

    public fillEmptySlotsWithDefaultSchedules() {
        this.schedules = this.fillEmptyWithDefaultService.fill(this, this.config);
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

    public purgeDefaultSchedules() {
        this.schedules = this.purgeDefaultService.purge(this.schedules, this.config);
    }

    public removeSchedule(schedule: WeeklySchedulerRange<T>) {
        let schedules = this.schedules;

        schedules.splice(schedules.indexOf(schedule), 1);

        this.config.onRemove();
    }

    // Overlap handlers

    private getOverlapHandler(overlapState: OverlapState) {
        const overlapHandlers: { [key: number]: (current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>) => void; } = {
            [OverlapState.NoOverlap]: (current, other) => this.handleNoOverlap(current, other),
            [OverlapState.CurrentIsInsideOther]: (current, other) => this.handleCurrentIsInsideOther(current, other),
            [OverlapState.CurrentCoversOther]: (current, other) => this.handleCurrentCoversOther(current, other),
            [OverlapState.OtherEndIsInsideCurrent]: (current, other) => this.handleOtherEndIsInsideCurrent(current, other),
            [OverlapState.OtherStartIsInsideCurrent]: (current, other) => this.handleOtherStartIsInsideCurrent(current, other),
            [OverlapState.OtherEndIsCurrentStart]: (current, other) => this.handleOtherEndIsCurrentStart(current, other),
            [OverlapState.OtherStartIsCurrentEnd]: (current, other) => this.handleOtherStartIsCurrentEnd(current, other)
        };

        return overlapHandlers[overlapState];
    }

    private handleCurrentCoversOther(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        this.removeSchedule(other);
    }

    private handleCurrentIsInsideOther(current: WeeklySchedulerRange<any>, other: WeeklySchedulerRange<any>): void {
        if (current.hasSameValueAs(other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeSchedule(other);

            current.update({
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

            current.update({
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        } else {
            other.update({
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

            current.update({
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        } else {
            other.update({
                day: other.day,
                start: current.end,
                end: other.end,
                value: other.value
            });
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
            if (!el.equals(schedule)) {
                let overlapState = this.overlapService.getOverlapState(this.config, schedule, el);
                let overlapHandler = this.getOverlapHandler(overlapState);

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
