/**
 * Implement this on a client and then pass it in to the component.
 */
export interface IWeeklySchedulerAdapter<TCustom, TValue> {
    customModelToWeeklySchedulerRange(custom: TCustom): br.weeklyScheduler.IWeeklySchedulerRange<TValue>;

    /** Transform the data held within the component to the format you need it outside of the component. */
    getSnapshot(): TCustom[];

    /** This just needs to be defined in the class, we'll set it internally */
    items: br.weeklyScheduler.IWeeklySchedulerItem<TValue>[];

    initialData: TCustom[];
}