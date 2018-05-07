/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/schedule-validator-service.ts" />
/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerConfig.d.ts" />

describe('schedule validator service', function () {
    var $service: ScheduleValidatorService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function (_scheduleValidatorService_) {
        $service = _scheduleValidatorService_;
    }));

    var testConfig: IWeeklySchedulerConfig = {
        maxValue: 1440,
        hourCount: 24,
        intervalCount: 1440 / 15
    }

    function getTestItem(schedules) {
        return {
            defaultValue: true,
            label: 'test',
            editable: true,
            schedules: schedules
        }
    }

    describe('should validate', function () {
        describe('calendars with gaps', () => {
            it('as valid when fullCalendar is false', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true },
                    { start: 120, end: 1395, value: true }
                ]);

                let config = angular.extend(angular.copy(testConfig), { fullCalendar: true });

                expect($service.areSchedulesValid(item, config)).toBeFalsy();
            });
        });

        describe('calendars without gaps', () => {
            it('as valid when fullCalendar is false', function () {
                let item = getTestItem([
                    { start: 0, end: 720, value: true },
                    { start: 720, end: 1440, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('as valid when fullCalendar is true', function () {
                let item = getTestItem([
                    { start: 0, end: 720, value: true },
                    { start: 720, end: 1440, value: true }
                ]);

                let config = angular.extend(angular.copy(testConfig), { fullCalendar: true });

                expect($service.areSchedulesValid(item, config)).toBeTruthy();
            });
        });

        describe('non-touching schedules', function () {
            it('with the same value as valid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('with different values as valid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: false }
                ]);
            });
        });

        describe('touching schedules', function () {
            it('with the same value as valid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('with different values as valid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: false }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });
        });

        describe('overlapping schedules', function () {
            it('with the same value as valid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('with different values as invalid', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: false }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeFalsy();
            });
        });

        describe('schedules with maxTimeSlot', function () {
            let maxTimeSlotConfig = angular.extend(angular.copy(testConfig), { maxTimeSlot: 60 });

            it('as valid when they do not exceed the maxTimeSlot length', () => {
                let singleItem = getTestItem([
                    { start: 0, end: 45, value: true }
                ]);

                expect($service.areSchedulesValid(singleItem, maxTimeSlotConfig)).toBeTruthy(); 

                let doubleItem = getTestItem([
                    { start: 0, end: 45, value: true },
                    { start: 60, end: 105, value: false }
                ]);

                expect($service.areSchedulesValid(doubleItem, maxTimeSlotConfig)).toBeTruthy();
            });

            it('as valid when they are exactly the maxTimeSlot length', () => {
                let singleItem = getTestItem([
                    { start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: true }
                ]);

                expect($service.areSchedulesValid(singleItem, maxTimeSlotConfig)).toBeTruthy();

                let doubleItem = getTestItem([
                    { start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: true },
                    { start: maxTimeSlotConfig.maxTimeSlot, end: maxTimeSlotConfig.maxTimeSlot + maxTimeSlotConfig.maxTimeSlot, value: false }
                ]);

                expect($service.areSchedulesValid(doubleItem, maxTimeSlotConfig)).toBeTruthy();
            });

            it('as invalid when they do exceed the maxTimeSlot length', function () {
                let singleItem = getTestItem([
                    { start: 0, end: 75, value: true }
                ]);

                expect($service.areSchedulesValid(singleItem, maxTimeSlotConfig)).toBeFalsy();

                let doubleItem = getTestItem([
                    { start: 0, end: 75, value: true },
                    { start: 90, end: 180, value: false }
                ]);

                expect($service.areSchedulesValid(doubleItem, maxTimeSlotConfig)).toBeFalsy();
            });
        });
    });
});
