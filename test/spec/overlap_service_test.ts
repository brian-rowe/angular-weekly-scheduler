/// <reference path="../../app/ng-weekly-scheduler/overlap/overlap-service.ts" />
/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-config/OverlapStates.d.ts" />

describe('overlap service', () => {
    var $service: OverlapService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerOverlapService_) {
        $service = _brWeeklySchedulerOverlapService_;
    }));

    describe('getOverlapState', () => {
        describe('should return', () => {
            it('NoOverlap when items do not touch', () => {
                expect($service.getOverlapState(0, 15, 30, 45)).toBe(OverlapState.NoOverlap);
            });

            it('CurrentIsInsideOther when current item is entirely within other item', () => {
                expect($service.getOverlapState(15, 30, 0, 45)).toBe(OverlapState.CurrentIsInsideOther);
            });

            it('CurrentCoversOther when current item entirely covers other item', () => {
                expect($service.getOverlapState(0, 45, 15, 30)).toBe(OverlapState.CurrentCoversOther);
            });

            it('OtherEndIsInsideCurrent when right edge of other item overlaps left edge of current item', () => {
                expect($service.getOverlapState(15, 45, 0, 30)).toBe(OverlapState.OtherEndIsInsideCurrent);
            });

            it('OtherStartIsInsideCurrent when left edge of other item overlaps right edge of current item', () => {
                expect($service.getOverlapState(0, 30, 15, 45)).toBe(OverlapState.OtherStartIsInsideCurrent);
            });

            it('OtherEndIsCurrentStart when right edge of other item IS left edge of current item', () => {
                expect($service.getOverlapState(30, 45, 0, 30)).toBe(OverlapState.OtherEndIsCurrentStart);
            });

            it('OtherStartIsCurrentEnd when left edge of other item IS right edge of current item', () => {
                expect($service.getOverlapState(0, 30, 30, 45)).toBe(OverlapState.OtherStartIsCurrentEnd);
            });
        });
    });
});
