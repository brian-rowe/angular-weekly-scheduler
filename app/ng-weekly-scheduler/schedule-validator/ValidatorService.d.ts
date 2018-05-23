/** @internal */
interface ValidatorService {
    validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
