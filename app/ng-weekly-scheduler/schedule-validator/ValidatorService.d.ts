/** @internal */
interface ValidatorService {
    error: ValidationError;
    validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean;
}
