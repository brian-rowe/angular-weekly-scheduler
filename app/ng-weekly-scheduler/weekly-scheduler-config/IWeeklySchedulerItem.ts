interface IWeeklySchedulerItem<T> {
    day: Days;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}

/** Use this for properties you need access to but don't want exposed to clients */
/** @internal */
interface IInternalWeeklySchedulerItem<T> extends IWeeklySchedulerItem<T> {
    label: string;
}
