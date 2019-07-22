import * as angular from 'angular';
import { FullCalendarValidatorService } from '../../src/ng-weekly-scheduler/schedule-validator/FullCalendarValidatorService';

describe('full calendar validator service', function () {
    var $q: angular.IQService;
    var $service: FullCalendarValidatorService;

    beforeEach(angular.mock.module('br.weeklyScheduler'));

    beforeEach(inject(function (_$q_, _brWeeklySchedulerFullCalendarValidatorService_) {
        $q = _$q_,
        $service = _brWeeklySchedulerFullCalendarValidatorService_;
    }));

    describe('should validate', function () {
        let createItem = (day, schedules) => {
            return { day: day, schedules: schedules }
        };

        let fullCalendarConfig = {
            createItem: createItem,
            defaultValue: '',
            fullCalendar: true,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            saveScheduler: () => $q.when(true)
        };

        let nonFullCalendarConfig = {
            createItem: createItem,
            defaultValue: '',
            fullCalendar: false,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440,
            saveScheduler: () => $q.when(true)
        };

        describe('calendars with schedules that have endTime=0', () => {
            it('as if the endTime was maxValue', () => {
                let zeroEnd = [
                    { day: 1, start: 0, end: 720, value: true },
                    { day: 1, start: 720, end: 0, value: false }
                ]

                expect($service.validate(zeroEnd, fullCalendarConfig)).toBeTruthy();
            });
        });

        describe('calendars whose items do not begin at the start', () => {
            let offStartNoGaps = [
                { day: 2, start: 30, end: 60, value: true },
                { day: 2, start: 60, end: 720, value: true },
                { day: 2, start: 720, end: 1440, value: true }
            ]; 

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(offStartNoGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                expect($service.validate(offStartNoGaps, fullCalendarConfig)).toBeFalsy();
            });
        });

        describe('calendars whose items do not end at the end', () => {
            let offEndNoGaps = [
                { day: 3, start: 0, end: 60, value: true },
                { day: 3, start: 60, end: 720, value: true },
                { day: 3, start: 720, end: 1395, value: true }
            ]; 

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(offEndNoGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                expect($service.validate(offEndNoGaps, fullCalendarConfig)).toBeFalsy();
            });
        });


        describe('calendars with gaps', () => {
            let withGaps = [
                { day: 4, start: 0, end: 60, value: true },
                { day: 4, start: 75, end: 120, value: true },
                { day: 4, start: 120, end: 1440, value: true }
            ];

            it('as valid when fullCalendar is false', function () {
                expect($service.validate(withGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', function () {
                expect($service.validate(withGaps, fullCalendarConfig)).toBeFalsy();
            });
        });

        describe('calendars without gaps', () => {
            let withoutGaps = [
                { day: 5, start: 0, end: 720, value: true },
                { day: 5, start: 720, end: 1440, value: true }
            ];

            it('as valid when fullCalendar is false', function () {
                expect($service.validate(withoutGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as valid when fullCalendar is true', function () {
                expect($service.validate(withoutGaps, fullCalendarConfig)).toBeTruthy();
            });
        });

        describe('calendars with no schedules', () => {
            let item = [];

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(item, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                expect($service.validate(item, fullCalendarConfig)).toBeFalsy();
            })
        });

        describe('calendars with one item that does not span the whole day', () => {
            let item = [
                { day: 6, start: 300, end: 600, value: true }
            ];

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(item, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                expect($service.validate(item, fullCalendarConfig)).toBeFalsy();
            });
        });

        describe('calendars that come in out of order', () => {
            it('as valid if they would be valid in order', () => {
                let item = [
                    { day: 0, start: 720, end: 1440, value: true },
                    { day: 0, start: 0, end: 720, value: false }
                ]

                expect($service.validate(item, fullCalendarConfig)).toBeTruthy();
            });
        })
    });
});
