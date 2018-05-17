/** Converts custom model to WeeklySchedulerRange */
namespace br.weeklyScheduler {
    export interface IWeeklySchedulerRangeAdapter<TCustom, TRange> {
        adapt(custom: TCustom[]): br.weeklyScheduler.IWeeklySchedulerRange<TRange>[];
    }
}
