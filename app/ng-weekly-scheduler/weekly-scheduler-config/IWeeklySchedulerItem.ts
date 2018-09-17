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

    constructor(
        public config: IWeeklySchedulerConfig<T>,
        private item: IInternalWeeklySchedulerItem<T>,
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

    public needsOverlapsMerged() {
        let len = this.schedules.length;

        // Compare two at a time
        for (let i = 0; i < len - 1; i += 1) {
            let current = this.schedules[i];
            let next = this.schedules[i+1];

            if (current.hasSameValueAs(next)) {
                let overlapState = this.overlapService.getOverlapState(this.config, current, next);

                return [OverlapState.OtherEndIsCurrentStart, OverlapState.OtherStartIsCurrentEnd].indexOf(overlapState) > -1;
            }
        }
    }

    public removeSchedule(schedule: WeeklySchedulerRange<T>) {
        let schedules = this.schedules;

        schedules.splice(schedules.indexOf(schedule), 1);
    }
}
