import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';

/** Use this for properties you need access to but don't want exposed to clients */
/** @internal */
export interface IInternalWeeklySchedulerItem<T> extends IWeeklySchedulerItem<T> {
    label: string;
}
