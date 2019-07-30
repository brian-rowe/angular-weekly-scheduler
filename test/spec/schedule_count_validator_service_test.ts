import * as angular from 'angular';
import { ScheduleCountValidatorService } from '../../src/ng-weekly-scheduler/schedule-validator/ScheduleCountValidatorService';

export class ScheduleCountValidatorServiceTests {
    static run() {
        describe('schedule count validator service', () => {
            let $q: angular.IQService;
            let $service: ScheduleCountValidatorService;

            beforeEach(inject(function (_$q_, _brWeeklySchedulerScheduleCountValidatorService_) {
                $service = _brWeeklySchedulerScheduleCountValidatorService_;
            }));

            describe('should validate', () => {
                let createItem = (day, schedules) => {
                    return { day: day, schedules: schedules }
                };

                let exactConfig = {
                    createItem: createItem,
                    defaultValue: true,
                    hourCount: 24,
                    intervalCount: 96,
                    maxValue: 1440,
                    saveScheduler: () => $q.when(true),
                    scheduleCountOptions: {
                        count: 2,
                        exact: true
                    }
                };

                let maxConfig = {
                    createItem: createItem,
                    defaultValue: true,
                    hourCount: 24,
                    intervalCount: 96,
                    maxValue: 1440,
                    saveScheduler: () => $q.when(true),
                    scheduleCountOptions: {
                        count: 2,
                        exact: false
                    }
                }

                describe('when exact is true', () => {
                    it('that the item has exactly "count" schedules', () => {
                        expect($service.validate([], exactConfig)).toBeFalsy();
                        expect($service.validate([{ day: 0, start: 300, end: 600, value: true }], exactConfig)).toBeFalsy();
                        expect($service.validate([{ day: 0, start: 300, end: 600, value: true }, { day: 0, start: 600, end: 900, value: true }], exactConfig)).toBeTruthy();
                    });
                });

                describe('when exact is false', () => {
                    it('that the item has up to "count" schedules', () => {
                        expect($service.validate([], maxConfig)).toBeTruthy();
                        expect($service.validate([{ day: 0, start: 300, end: 600, value: true }], maxConfig)).toBeTruthy();
                        expect($service.validate([{ day: 0, start: 300, end: 600, value: true }, { day: 0, start: 600, end: 900, value: true }], maxConfig)).toBeTruthy();

                        expect($service.validate([
                            { day: 0, start: 300, end: 600, value: true },
                            { day: 0, start: 600, end: 900, value: true },
                            { day: 0, start: 900, end: 1200, value: true }
                        ], maxConfig)).toBeFalsy();
                    });
                });
            });
        });
    }
}
