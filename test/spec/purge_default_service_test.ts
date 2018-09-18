/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory.ts" />
/// <reference path="../../app/ng-weekly-scheduler/purge-default/PurgeDefaultService.ts" />

describe('purgeDefault service', () => {
    var $itemFactory: WeeklySchedulerItemFactory;
    var $service: PurgeDefaultService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerItemFactory_, _brWeeklySchedulerPurgeDefaultService_) {
        $itemFactory = _brWeeklySchedulerItemFactory_;
        $service = _brWeeklySchedulerPurgeDefaultService_;
    }));

    describe('purge', () => {
        describe('should return', () => {
            let createItem = (day, schedules) => {
                return { day: day, schedules: schedules }
            };

            let config = {
                createItem: createItem,
                defaultValue: false,
                maxValue: 1440,
                hourCount: 24,
                intervalCount: 96
            }

            it ('should return a full day of schedules with default-valued slots missing', () => {
                let item = $itemFactory.createItem(config, 0, [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 720, end: 780, value: config.defaultValue },
                    { day: 0, start: 780, end: 900, value: true },
                    { day: 0, start: 900, end: config.maxValue, value: config.defaultValue }
                ]);

                let expectedResult = $itemFactory.createItem(config, 0, [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 780, end: 900, value: true }
                ]);

                let actualResult = $service.purge(item.schedules, config);

                expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();
            });
        });
    });
});
