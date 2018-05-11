/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/overlap-validator-service.ts" />
/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerConfig.d.ts" />

describe('overlap validator service', function () {
    var $service: OverlapValidatorService;

    beforeEach(angular.mock.module('weeklyScheduler'));

    beforeEach(inject(function (_overlapValidatorService_) {
        $service = _overlapValidatorService_;
    }));

    var testConfig = {
        createItem: (day, schedules) => {
            return { defaultValue: 0, day: day, schedules: schedules }
        },
        maxValue: 1440,
        hourCount: 24,
        intervalCount: 1440 / 15
    }

    function getTestItem(schedules) {
        return {
            defaultValue: true,
            editable: true,
            schedules: schedules
        }
    }

    describe('should validate', function () {
        let maxValue = 24 * 60;

        describe('non-touching schedules', function () {
            it('with the same value as valid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: true }
                ]; 

                expect($service.validate(item, maxValue)).toBeTruthy();
            });

            it('with different values as valid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 75, end: 120, value: false }
                ];
                
                expect($service.validate(item, maxValue)).toBeTruthy();
            });
        });

        describe('touching schedules', function () {
            it('with the same value as valid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: true }
                ];

                expect($service.validate(item, maxValue)).toBeTruthy();
            });

            it('with different values as valid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 60, end: 120, value: false }
                ];

                expect($service.validate(item, maxValue)).toBeTruthy();
            });
        });

        describe('overlapping schedules', function () {
            it('with the same value as valid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: true }
                ];

                expect($service.validate(item, maxValue)).toBeTruthy();
            });

            it('with different values as invalid', function () {
                let item = [
                    { start: 0, end: 60, value: true },
                    { start: 45, end: 120, value: false }
                ];

                expect($service.validate(item, maxValue)).toBeFalsy();
            });
        });
    });
});
