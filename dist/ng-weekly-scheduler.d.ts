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
    /** This will indicate whether the item is currently considered active to the UI */
    $isActive?: boolean;
    start: number;
    end: number;
}
