/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/full-calendar-validator-service.ts" />

describe('full calendar validator service', function () {
    var $service: FullCalendarValidatorService;

    beforeEach(angular.mock.module('weeklyScheduler'));

    beforeEach(inject(function (_fullCalendarValidatorService_) {
        $service = _fullCalendarValidatorService_;
    }));

    describe('should validate', function () {
        let fullCalendarConfig = {
            fullCalendar: true,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440
        };

        let nonFullCalendarConfig = {
            fullCalendar: false,
            hourCount: 24,
            intervalCount: 96,
            maxValue: 1440
        };

        describe('calendars with schedules that have endTime=0', () => {
            it('as if the endTime was maxValue', () => {
                let zeroEnd = [
                    { start: 0, end: 720, value: true },
                    { start: 720, end: 0, value: false }
                ]

                expect($service.validate(zeroEnd, fullCalendarConfig)).toBeTruthy();
            });
        });

        describe('calendars whose items do not begin at the start', () => {
            let offStartNoGaps = [
                { start: 30, end: 60, value: true },
                { start: 60, end: 720, value: true },
                { start: 720, end: 1440, value: true }
            ]; 

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(offStartNoGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                debugger
                expect($service.validate(offStartNoGaps, fullCalendarConfig)).toBeFalsy();
            });
        });

        describe('calendars whose items do not end at the end', () => {
            let offEndNoGaps = [
                { start: 0, end: 60, value: true },
                { start: 60, end: 720, value: true },
                { start: 720, end: 1395, value: true }
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
                { start: 0, end: 60, value: true },
                { start: 75, end: 120, value: true },
                { start: 120, end: 1440, value: true }
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
                { start: 0, end: 720, value: true },
                { start: 720, end: 1440, value: true }
            ];

            it('as valid when fullCalendar is false', function () {
                expect($service.validate(withoutGaps, nonFullCalendarConfig)).toBeTruthy();
            });

            it('as valid when fullCalendar is true', function () {
                expect($service.validate(withoutGaps, fullCalendarConfig)).toBeTruthy();
            });
        });
    });
});
