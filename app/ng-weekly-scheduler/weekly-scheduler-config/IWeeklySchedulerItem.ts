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
