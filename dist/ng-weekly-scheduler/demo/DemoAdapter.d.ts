import { IWeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { DemoItem } from './DemoItem';
/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
export declare class DemoAdapter implements IWeeklySchedulerAdapter<IWeeklySchedulerRange<boolean>, boolean> {
    initialData: IWeeklySchedulerRange<boolean>[];
    items: DemoItem[];
    constructor(initialData: IWeeklySchedulerRange<boolean>[]);
    getSnapshot(): any;
    customModelToWeeklySchedulerRange(range: any): any;
}
