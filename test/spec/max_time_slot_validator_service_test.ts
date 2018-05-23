/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/max-time-slot-validator-service.ts" />

describe('max time slot validator service', function () {
    var $q: angular.IQService;
    var $service: MaxTimeSlotValidatorService;

    beforeEach(angular.mock.module('br.weeklyScheduler'));

    beforeEach(inject(function (_brWeeklySchedulerMaxTimeSlotValidatorService_) {
        $service = _brWeeklySchedulerMaxTimeSlotValidatorService_;
    }));

    describe('should validate', function () {
        let createItem = (day, schedules) => {
            return { day: day, schedules: schedules }
        };

        let maxTimeSlotConfig = {
            createItem: createItem,
            defaultValue: true,
            fullCalendar: false,
            hourCount: 24,
            intervalCount: 96,
            maxTimeSlot: 60,
            maxValue: 1440,
            saveScheduler: () => $q.when(true)
        };

        it('as valid when they do not exceed the maxTimeSlot length', () => {
            let singleSchedule = [
                { day: 0, start: 0, end: 45, value: true }
            ];

            expect($service.validate(singleSchedule, maxTimeSlotConfig)).toBeTruthy(); 

            let doubleSchedule = [
                { day: 0, start: 0, end: 45, value: true },
                { day: 0, start: 60, end: 105, value: false }
            ];

            expect($service.validate(doubleSchedule, maxTimeSlotConfig)).toBeTruthy();
        });

        it('as valid when they are exactly the maxTimeSlot length', () => {
            let singleSchedule = [
                { day: 1, start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: true }
            ];

            expect($service.validate(singleSchedule, maxTimeSlotConfig)).toBeTruthy();

            let doubleSchedule = [
                { day: 2, start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: true },
                { day: 2, start: maxTimeSlotConfig.maxTimeSlot, end: maxTimeSlotConfig.maxTimeSlot * 2, value: false }
            ];

            expect($service.validate(doubleSchedule, maxTimeSlotConfig)).toBeTruthy();
        });

        it('as invalid when they do exceed the maxTimeSlot length', function () {
            let singleSchedule = [
                { day: 3, start: 0, end: 75, value: true }
            ];

            expect($service.validate(singleSchedule, maxTimeSlotConfig)).toBeFalsy();

            let doubleSchedule = [
                { day: 4, start: 0, end: 75, value: true },
                { day: 4, start: 90, end: 180, value: false }
            ];

            expect($service.validate(doubleSchedule, maxTimeSlotConfig)).toBeFalsy();
        });
    });
});
