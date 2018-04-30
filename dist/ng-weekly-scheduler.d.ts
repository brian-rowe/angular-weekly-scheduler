interface IWeeklySchedulerItem<T> {
    label: string;
    editable?: boolean;
    schedules: IWeeklySchedulerRange<T>[];
}
interface IWeeklySchedulerOptions {
    editSlot?: (schedule: IWeeklySchedulerRange<any>) => void;
    monoSchedule?: boolean;
    interval?: number;
}
interface IWeeklySchedulerRange<T> {
    start: number;
    end: number;
}
