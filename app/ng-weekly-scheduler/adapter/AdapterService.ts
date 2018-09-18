/** @internal */
class AdapterService {
    static $name = 'brWeeklySchedulerAdapterService';

    static $inject = [
        'brWeeklySchedulerGroupService',
        'brWeeklySchedulerItemFactory'
    ];

    private constructor(
        private groupService: GroupService,
        private itemFactory: WeeklySchedulerItemFactory
    ) {
    }

    getItemsFromAdapter(config: IWeeklySchedulerConfig<any>, adapter: br.weeklyScheduler.IWeeklySchedulerAdapter<any, any>) {
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

angular
    .module('br.weeklyScheduler')
    .service(AdapterService.$name, AdapterService);
