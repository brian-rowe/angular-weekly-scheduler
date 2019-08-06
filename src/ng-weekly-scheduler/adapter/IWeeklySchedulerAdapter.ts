import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';

/**
 * Implement this on a client and then pass it in to the component.
 */
export interface IWeeklySchedulerAdapter<TCustom, TValue> {
    customModelToWeeklySchedulerRange(custom: TCustom): IWeeklySchedulerRange<TValue>;

    /** Transform the data held within the component to the format you need it outside of the component. */
    getSnapshot(): TCustom[];

    /** This just needs to be defined in the class, we'll set it internally */
    items: IWeeklySchedulerItem<TValue>[];

    initialData: TCustom[];
}
