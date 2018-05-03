/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/schedule-validator-service.ts" />

describe('schedule validator service', function () {
    var $service: ScheduleValidatorService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_scheduleValidatorService_) {
        $service = _scheduleValidatorService_;
    }));

    var testConfig = {
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

    describe('should validate', function() {
        describe('calendars with gaps', () => {
            it('as valid when fullCalendar is false', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true } 
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', function () {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true } 
                ]);

                let config = angular.extend(testConfig, { fullCalendar: true });

                expect($service.areSchedulesValid(item, config)).toBeFalsy();
            });
        });

        describe('calendars without gaps', () => {
            it('as valid when fullCalendar is false', function() {
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

                let config = angular.extend(testConfig, { fullCalendar: true });

                expect($service.areSchedulesValid(item, config)).toBeTruthy();
            });
        });

        describe('non-touching schedules', function () {
            it('with the same value as valid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true }
                ]);
    
                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('with different values as valid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: false }
                ]);
            });
        });

        describe('touching schedules', function () {
            it('with the same value as valid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: true }
                ]);
    
                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it('with different values as valid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: false }
                ]);
    
                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });
        });

        describe('overlapping schedules', function() {
            it('with the same value as valid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: true }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeTruthy();
            });

            it ('with different values as invalid', function() {
                let item = getTestItem([
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: false }
                ]);

                expect($service.areSchedulesValid(item, testConfig)).toBeFalsy();
            });
        });
    });
});
