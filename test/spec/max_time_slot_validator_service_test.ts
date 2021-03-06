import * as angular from 'angular';
import { MaxTimeSlotValidatorService } from '../../src/ng-weekly-scheduler/schedule-validator/MaxTimeSlotValidatorService';

export class MaxTimeSlotValidatorServiceTests {
    static run() {
        describe('max time slot validator service', function () {
            var $q: angular.IQService;
            var $service: MaxTimeSlotValidatorService;

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
                    maxTimeSlot: 3600,
                    maxValue: 86400,
                    saveScheduler: () => $q.when(true)
                };

                describe('schedules with default value', () => {
                    it('as valid when they do not exceed the maxTimeSlot length', () => {
                        let item = [
                            { day: 0, start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: maxTimeSlotConfig.defaultValue }
                        ];

                        expect($service.validate(item, maxTimeSlotConfig)).toBeTruthy();
                    });

                    it('as valid when they DO exceed the maxTimeSlotLength', () => {
                        let item = [
                            { day: 0, start: 0, end: maxTimeSlotConfig.maxTimeSlot * 2, value: maxTimeSlotConfig.defaultValue }
                        ];

                        expect($service.validate(item, maxTimeSlotConfig)).toBeTruthy();
                    });
                });

                describe('schedules with non-default value', () => {
                    it('as valid when they do not exceed the maxTimeSlot length', () => {
                        let item = [
                            { day: 0, start: 0, end: maxTimeSlotConfig.maxTimeSlot, value: 'blarg' }
                        ];

                        expect($service.validate(item, maxTimeSlotConfig)).toBeTruthy();
                    });

                    it('as invalid when they do exceed the maxTimeSlotLength', () => {
                        let item = [
                            { day: 0, start: 0, end: maxTimeSlotConfig.maxTimeSlot * 2, value: 'blarg' }
                        ];

                        expect($service.validate(item, maxTimeSlotConfig)).toBeFalsy();
                    });
                });

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
                        { day: 3, start: 0, end: 4500, value: false }
                    ];

                    expect($service.validate(singleSchedule, maxTimeSlotConfig)).toBeFalsy();

                    let doubleSchedule = [
                        { day: 4, start: 0, end: 4500, value: true },
                        { day: 4, start: 5400, end: 10800, value: false }
                    ];

                    expect($service.validate(doubleSchedule, maxTimeSlotConfig)).toBeFalsy();
                });

                describe('schedules with matching starts and ends', () => {
                    it('as invalid when they exceed the maxTimeSlotLength', () => {
                        let singleSchedule = [
                            { day: 3, start: 0, end: 0, value: false }
                        ];

                        expect($service.validate(singleSchedule, maxTimeSlotConfig)).toBeFalsy();
                    });
                });
            });
        });
    }
}
