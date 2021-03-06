import * as angular from 'angular';
import { OverlapService } from '../../src/ng-weekly-scheduler/overlap/OverlapService';
import { OverlapState } from '../../src/ng-weekly-scheduler/weekly-scheduler-config/OverlapStates';

export class OverlapServiceTests {
    static run() {
        describe('overlap service', () => {
            var $service: OverlapService;

            beforeEach(inject(function (_brWeeklySchedulerOverlapService_) {
                $service = _brWeeklySchedulerOverlapService_;
            }));

            describe('getOverlapState', () => {
                describe('should return', () => {
                    let createItem = (day, schedules) => {
                        return { day: day, schedules: schedules }
                    };

                    let config = {
                        createItem: createItem,
                        maxValue: 86400,
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
                        expect($service.getOverlapState(config, getSchedule(0, 16200), getSchedule(63000, 0))).toBe(OverlapState.NoOverlap);
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
    }
}
