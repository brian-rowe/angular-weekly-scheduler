import * as angular from 'angular';
import { DayMap } from '../weekly-scheduler-config/DayMap';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerItemFactory } from '../weekly-scheduler-item/WeeklySchedulerItemFactory';

/** @internal */
export class MissingDaysService {
    static $name = 'brWeeklySchedulerMissingDaysService';

    static $inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerItemFactory'
    ];

    private constructor(
        private dayMap: DayMap,
        private itemFactory: WeeklySchedulerItemFactory
    ) {
    }

    /**
     * The scheduler should always show all days, even if it was not passed any schedules for that day
     */
    public fillItems(config: IWeeklySchedulerConfig<any>, items: WeeklySchedulerItem<any>[]) {
        let result: WeeklySchedulerItem<any>[] = [];

        angular.forEach(this.dayMap, (day: string, stringKey: string) => {
          let key = parseInt(stringKey, 10);
          let filteredItems = items.filter(item => item.day === key);
          let item: WeeklySchedulerItem<any> = filteredItems.length ? filteredItems[0] : null;
    
          if (!item) {
            result.push(this.itemFactory.createItem(config, key, []));
          } else {
            // If the item DID exist just set the label
            item.label = day;
    
            result.push(item);
          }
        });
    
        return angular.copy(result).sort((a, b) => a.day - b.day);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MissingDaysService.$name, MissingDaysService);
