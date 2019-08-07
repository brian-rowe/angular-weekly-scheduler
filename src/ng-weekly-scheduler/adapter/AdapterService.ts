import { GroupService } from '../group-by/GroupService';
import { IWeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerItemFactory } from '../weekly-scheduler-item/WeeklySchedulerItemFactory';

/** @internal */
export class AdapterService {
    static $name = 'brWeeklySchedulerAdapterService';

    static $inject = [
      GroupService.$name,
      WeeklySchedulerItemFactory.$name
    ];

    private constructor(
        private groupService: GroupService,
        private itemFactory: WeeklySchedulerItemFactory
    ) {
    }

    getItemsFromAdapter(config: IWeeklySchedulerConfig<any>, adapter: IWeeklySchedulerAdapter<any, any>) {
        let result = [];

        if (adapter) {
          let schedules = adapter.initialData.map(data => adapter.customModelToWeeklySchedulerRange(data));
          let groupedSchedules = this.groupService.groupSchedules(schedules);
    
          for (let key in groupedSchedules) {
            let item = this.itemFactory.createItem(config, parseInt(key, 10), groupedSchedules[key]);
    
            result.push(item);
          }
        }
    
        return result;
    }
}
