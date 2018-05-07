/// <reference path="../../app/ng-weekly-scheduler/schedule-validator/full-calendar-validator-service.ts" />

describe('full calendar validator service', function () {
    var $service: FullCalendarValidatorService;

    beforeEach(angular.mock.module('weeklyScheduler'));

    beforeEach(inject(function (_fullCalendarValidatorService_) {
        $service = _fullCalendarValidatorService_;
    }));

    describe('should validate', function () {
        describe('calendars with gaps', () => {
            let withGaps = [
                { start: 0, end: 60, value: true },
                { start: 75, end: 120, value: true },
                { start: 120, end: 1395, value: true }
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
