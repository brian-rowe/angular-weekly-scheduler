/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/mono-schedule-validator-service.ts" />

describe('mono schedule validator service', () => {
    let $q: angular.IQService;
    let $service: MonoScheduleValidatorService;

    beforeEach(angular.mock.module('br.weeklyScheduler'));

    beforeEach(inject(function (_$q_, _brWeeklySchedulerMonoScheduleValidatorService_) {
        $service = _brWeeklySchedulerMonoScheduleValidatorService_;
    }));

    describe('should validate', () => {
        let createItem = (day, schedules) => {
            return { day: day, schedules: schedules }
        };

        let monoScheduleConfig = {
            createItem: createItem,
            defaultValue: true,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            monoSchedule: true,
            saveScheduler: () => $q.when(true)
        };

        let nonMonoScheduleConfig = {
            createItem: createItem,
            defaultValue: true,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            saveScheduler: () => $q.when(true)
        };

        describe('items with no schedules', () => {
            let item = [];

            it('as valid when monoSchedule is false', () => {
                expect($service.validate(item, nonMonoScheduleConfig)).toBeTruthy();
            });

            it('as valid when monoSchedule is true', () => {
                expect($service.validate(item, monoScheduleConfig)).toBeTruthy();
            });
        });

        describe('items with 1 schedule', () => {
            let item = [
                { day: 0, start: 300, end: 600, value: true }
            ];

            it('as valid when monoSchedule is false', () => {
                expect($service.validate(item, nonMonoScheduleConfig)).toBeTruthy();
            });

            it('as valid when monoSchedule is true', () => {
                expect($service.validate(item, monoScheduleConfig)).toBeTruthy();
            });
        });

        describe('items with multiple schedules', () => {
            let item = [
                { day: 0, start: 300, end: 600, value: true },
                { day: 0, start: 720, end: 900, value: false }
            ];

            it('as valid when monoSchedule is false', () => {
                expect($service.validate(item, nonMonoScheduleConfig)).toBeTruthy();
            });

            it('as invalid when monoSchedule is true', () => {
                expect($service.validate(item, monoScheduleConfig)).toBeFalsy();
            });
        });
    });
});
