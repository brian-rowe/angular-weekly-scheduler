import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';
import { Days } from '../weekly-scheduler-config/Days';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';

/** @internal */
export class DemoItem implements IWeeklySchedulerItem<boolean> {
  constructor(
    public day: Days,
    public schedules: IWeeklySchedulerRange<boolean>[]
  ) {
  }

  get editable() {
    return true;
  }
}
