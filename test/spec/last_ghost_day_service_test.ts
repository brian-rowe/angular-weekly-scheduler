import * as angular from 'angular';
import { WeeklySchedulerItemFactory } from '../../src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory';
import { LastGhostDayService } from '../../src/ng-weekly-scheduler/last-ghost-day/LastGhostDayService';

export class LastGhostDayServiceTests {
    static run() {
        describe('full calendar validator service', function () {
            var $q: angular.IQService;
            var $itemFactory: WeeklySchedulerItemFactory;
            var $service: LastGhostDayService;

            beforeEach(inject(function (_$q_, _rrWeeklySchedulerItemFactory_, _rrWeeklySchedulerLastGhostDayService_) {
                $q = _$q_;
                $itemFactory = _rrWeeklySchedulerItemFactory_;
                $service = _rrWeeklySchedulerLastGhostDayService_;
            }));

            describe('getLastGhostDay', function () {
                let createItem = (day, schedules) => {
                    return { day: day, schedules: schedules }
                };

                let config = {
                    createItem: createItem,
                    defaultValue: false,
                    maxValue: 1440,
                    hourCount: 24,
                    intervalCount: 96
                };

                let mon;
                let tue
                let wed
                let thu;
                let fri;
                let sat;
                let sun;

                beforeEach(() => {
                    mon = $itemFactory.createItem(config, 0, []);
                    tue = $itemFactory.createItem(config, 1, []);
                    wed = $itemFactory.createItem(config, 2, []);
                    thu = $itemFactory.createItem(config, 3, []);
                    fri = $itemFactory.createItem(config, 4, []);
                    sat = $itemFactory.createItem(config, 5, []);
                    sun = $itemFactory.createItem(config, 6, []);
                });

                it('should return the earliest day before the origin if all other items are above the origin', () => {
                    tue.$renderGhost = true;
                    wed.$renderGhost = true;
                    thu.$renderGhost = true;
                    fri.$renderGhost = true;
                    fri.$isGhostOrigin = true;

                    let items = [mon, tue, wed, thu, fri, sat, sun];

                    let index = $service.getLastGhostDay(items);

                    expect(index).toBe(tue.day);
                });

                it('should return the last day dafter the origin if all other items are below the origin', () => {
                    tue.$renderGhost = true;
                    tue.$isGhostOrigin = true;

                    wed.$renderGhost = true;
                    thu.$renderGhost = true;
                    fri.$renderGhost = true;

                    let items = [mon, tue, wed, thu, fri, sat, sun];

                    let index = $service.getLastGhostDay(items);

                    expect(index).toBe(fri.day);
                });
            });
        });
    }
}
