import { IWeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { DemoItem } from './DemoItem';


  /** The data is already in an acceptable format for the demo so just pass it through */
  /** @internal */
  export class DemoAdapter implements IWeeklySchedulerAdapter<IWeeklySchedulerRange<boolean>, boolean> {
    public items: DemoItem[] = [];

    constructor(
      public initialData: IWeeklySchedulerRange<boolean>[],
    ) {
    }

    public getSnapshot() {
      return Array.prototype.concat.apply([], this.items.map(item => {
        return item.schedules.map(schedule => {
          return {
            day: schedule.day,
            start: schedule.start,
            end: schedule.end,
            value: schedule.value
          }
        });
      }));
    }

    public customModelToWeeklySchedulerRange(range) {
      range.$class = 'test';

      return range;
    }
  }