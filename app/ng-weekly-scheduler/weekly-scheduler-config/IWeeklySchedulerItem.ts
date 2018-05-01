interface IWeeklySchedulerItem<T> {
    defaultValue: T;
    label: string;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
