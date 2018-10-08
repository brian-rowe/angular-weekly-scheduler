/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/MinimumSeparationValidatorService.ts" />

describe('minimum separation validator service', function () {
    var $q: angular.IQService;
    var $service: MinimumSeparationValidatorService;

    beforeEach(angular.mock.module('br.weeklyScheduler'));

    beforeEach(inject(function (_brWeeklySchedulerMinimumSeparationValidatorService_) {
        $service = _brWeeklySchedulerMinimumSeparationValidatorService_;
    }));

    describe('should validate', function () {
        let createItem = (day, schedules) => {
            return { day: day, schedules: schedules }
        };

        let normalConfig = {
            createItem: createItem,
            defaultValue: true,
            fullCalendar: false,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            saveScheduler: () => $q.when(true)
        };

        let minimumSeparationConfig = {
            createItem: createItem,
            defaultValue: true,
            fullCalendar: false,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            minimumSeparation: 5,
            saveScheduler: () => $q.when(true)
        };

        describe('no schedule', () => {
            let item = [
            ];

            it('as valid when minimum separation is not defined', () => {
                expect($service.validate(item, normalConfig)).toBeTruthy();
            });

            it('as valid when minimum separation is defined', () => {
                expect($service.validate(item, minimumSeparationConfig)).toBeTruthy();
            });
        });

        describe('a single schedule', () => {
            let item = [
                { day: 0, start: 300, end: 600, value: true }
            ];

            it('as valid when minimum separation is not defined', () => {
                expect($service.validate(item, normalConfig)).toBeTruthy();
            });

            it('as valid when minimum separation is defined', () => {
                expect($service.validate(item, minimumSeparationConfig)).toBeTruthy();
            });
        });

        describe('touching schedules', () => {
            let item = [
                { day: 0, start: 300, end: 600, value: true },
                { day: 0, start: 600, end: 900, value: false }
            ];

            it('as valid when minimum separation is not defined', () => {
                expect($service.validate(item, normalConfig)).toBeTruthy();
            });

            it('as invalid when minimum separation is defined', () => {
                expect($service.validate(item, minimumSeparationConfig)).toBeFalsy();
            });
        });

        describe('non touching schedules', () => {
            let item = [
                { day: 0, start: 300, end: 600, value: true },
                { day: 0, start: 603, end: 900, value: false }
            ];

            let item2 = [
                { day: 0, start: 300, end: 600, value: true },
                { day: 0, start: 630, end: 900, value: false }
            ];
            it('as valid when minimum separation is not defined', () => {
                expect($service.validate(item, normalConfig)).toBeTruthy();
                expect($service.validate(item2, normalConfig)).toBeTruthy();
            });

            it('as invalid when minimum separation is defined and they are not sufficiently far apart', () => {
                expect($service.validate(item, minimumSeparationConfig)).toBeFalsy();
            });

            it('as valid when minimum separation is defined and they are sufficiently far apart', () => {
                expect($service.validate(item2, minimumSeparationConfig)).toBeTruthy();
            });
        });
    });
});
