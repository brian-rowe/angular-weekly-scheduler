/// <reference path="../../app/ng-weekly-scheduler/overlap/OverlapService.ts" />
/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-config/OverlapStates.d.ts" />

describe('overlap service', () => {
    var $service: OverlapService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerOverlapService_) {
        $service = _brWeeklySchedulerOverlapService_;
    }));

    describe('getOverlapState', () => {
        describe('should return', () => {
            let createItem = (day, schedules) => {
                return { day: day, schedules: schedules }
            };

            let config = {
                createItem: createItem,
                maxValue: 1440,
                hourCount: 24,
                intervalCount: 96
            }

            let getSchedule = (start, end) => {
                return {
                    day: 0,
                    start: start,
                    end: end,
                    value: ''
                }
            }

            it('NoOverlap when items do not touch', () => {
                expect($service.getOverlapState(config, getSchedule(0, 15), getSchedule(30, 45))).toBe(OverlapState.NoOverlap);
            });

            it('CurrentIsInsideOther when current item is entirely within other item', () => {
                expect($service.getOverlapState(config, getSchedule(15, 30), getSchedule(0, 45))).toBe(OverlapState.CurrentIsInsideOther);
            });

            it('CurrentCoversOther when current item entirely covers other item', () => {
                expect($service.getOverlapState(config, getSchedule(0, 45), getSchedule(15, 30))).toBe(OverlapState.CurrentCoversOther);
            });

            it('OtherEndIsInsideCurrent when right edge of other item overlaps left edge of current item', () => {
                expect($service.getOverlapState(config, getSchedule(15, 45), getSchedule(0, 30))).toBe(OverlapState.OtherEndIsInsideCurrent);
            });

            it('OtherStartIsInsideCurrent when left edge of other item overlaps right edge of current item', () => {
                expect($service.getOverlapState(config, getSchedule(0, 30), getSchedule(15, 45))).toBe(OverlapState.OtherStartIsInsideCurrent);
            });

            it('OtherEndIsCurrentStart when right edge of other item IS left edge of current item', () => {
                expect($service.getOverlapState(config, getSchedule(30, 45), getSchedule(0, 30))).toBe(OverlapState.OtherEndIsCurrentStart);
            });

            it('OtherStartIsCurrentEnd when left edge of other item IS right edge of current item', () => {
                expect($service.getOverlapState(config, getSchedule(0, 30), getSchedule(30, 45))).toBe(OverlapState.OtherStartIsCurrentEnd);
            });
        });
    });
});
