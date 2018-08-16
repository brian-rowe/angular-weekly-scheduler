/// <reference path="../../app/ng-weekly-scheduler/fill-empty-with-default/fill-empty-with-default-service.ts" />

describe('fillEmptyWithDefault service', () => {
    var $service: FillEmptyWithDefaultService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerFillEmptyWithDefaultService_) {
        $service = _brWeeklySchedulerFillEmptyWithDefaultService_;
    }));

    describe('getOverlapState', () => {
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

            it ('should return a full calendar with the default values in place of the empty slots', () => {
                let schedules = [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 780, end: 900, value: true }
                ];

                let expectedResult = [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 720, end: 780, value: config.defaultValue },
                    { day: 0, start: 780, end: 900, value: true },
                    { day: 0, start: 900, end: config.maxValue, value: config.defaultValue }
                ];

                let actualResult = $service.fill(schedules, config);

                expect(angular.equals(actualResult, expectedResult)).toBeTruthy();
            });
        });
    });
});
