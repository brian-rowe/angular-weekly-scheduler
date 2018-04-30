interface IWeeklySchedulerOptions {
    editSlot?: (schedule: IWeeklySchedulerRange<any>) => void;
    monoSchedule?: boolean;
    interval?: number;
}