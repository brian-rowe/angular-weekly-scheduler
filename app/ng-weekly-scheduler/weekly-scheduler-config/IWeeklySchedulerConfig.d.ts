interface IWeeklySchedulerConfig<T> extends br.weeklyScheduler.IWeeklySchedulerOptions<T> {
    maxValue: number;
    hourCount: number;
    intervalCount: number;
}