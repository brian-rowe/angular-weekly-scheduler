/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/full-calendar-validator-service.ts" />

describe('full calendar validator service', function () {
    var $service: FullCalendarValidatorService;

    beforeEach(angular.mock.module('weeklyScheduler'));

    beforeEach(inject(function (_fullCalendarValidatorService_) {
        $service = _fullCalendarValidatorService_;
    }));

    describe('should validate', function () {
        describe('calendars whose items do not begin at the start', () => {
            let offStartNoGaps = [
                { start: 30, end: 60, value: true },
                { start: 60, end: 720, value: true },
                { start: 720, end: 1440, value: true }
            ]; 

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(offStartNoGaps, false)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                debugger
                expect($service.validate(offStartNoGaps, true)).toBeFalsy();
            });
        });

        describe('calendars whose items do not end at the end', () => {
            let offEndNoGaps = [
                { start: 0, end: 60, value: true },
                { start: 60, end: 720, value: true },
                { start: 720, end: 1395, value: true }
            ]; 

            it('as valid when fullCalendar is false', () => {
                expect($service.validate(offEndNoGaps, false)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', () => {
                expect($service.validate(offEndNoGaps, true)).toBeFalsy();
            });
        });


        describe('calendars with gaps', () => {
            let withGaps = [
                { start: 0, end: 60, value: true },
                { start: 75, end: 120, value: true },
                { start: 120, end: 1440, value: true }
            ];

            it('as valid when fullCalendar is false', function () {
                expect($service.validate(withGaps, false)).toBeTruthy();
            });

            it('as invalid when fullCalendar is true', function () {
                expect($service.validate(withGaps, true)).toBeFalsy();
            });
        });

        describe('calendars without gaps', () => {
            let withoutGaps = [
                { start: 0, end: 720, value: true },
                { start: 720, end: 1440, value: true }
            ];

            it('as valid when fullCalendar is false', function () {
                expect($service.validate(withoutGaps, false)).toBeTruthy();
            });

            it('as valid when fullCalendar is true', function () {
                expect($service.validate(withoutGaps, true)).toBeTruthy();
            });
        });
    });
});
