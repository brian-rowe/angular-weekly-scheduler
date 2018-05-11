/** Converts custom model to WeeklySchedulerRange */
interface IWeeklySchedulerRangeAdapter<TCustom, TRange> {
    adapt(custom: TCustom[]): IWeeklySchedulerRange<TRange>[];
}
