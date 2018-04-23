interface IWeeklySchedulerItem<T> {
    label: string;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}