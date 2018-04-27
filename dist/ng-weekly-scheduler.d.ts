interface IWeeklySchedulerItem<T> {
    label: string;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
interface IWeeklySchedulerRange<T> {
    start: number;
    end: number;
}
