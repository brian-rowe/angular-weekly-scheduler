export class NullEndValidatorServiceTests {
    static run() {
        describe('null end validator service', () => {
            let $service;
            let $q;

            beforeEach(inject(function (_$q_, _rrWeeklySchedulerNullEndValidatorService_) {
                $q = _$q_;
                $service = _rrWeeklySchedulerNullEndValidatorService_;
            }));

            describe('should validate', () => {
                let createItem = (day, schedules) => {
                    return { day: day, schedules: schedules }
                };

                let nullEndsConfig = {
                    nullEnds: true,
                    createItem: createItem,
                    defaultValue: true,
                    hourCount: 24,
                    intervalCount: 96,
                    maxValue: 1440,
                    monoSchedule: true,
                    saveScheduler: () => $q.when(true)
                };

                let noNullEndsConfig = {
                    nullEnds: false,
                    createItem: createItem,
                    defaultValue: true,
                    hourCount: 24,
                    intervalCount: 96,
                    maxValue: 1440,
                    monoSchedule: true,
                    saveScheduler: () => $q.when(true)
                }

                describe('items with no schedules', () => {
                    let item = [];

                    it('as valid when nullEnds is false', () => {
                        expect($service.validate(item, noNullEndsConfig)).toBeTruthy();
                    });

                    it('as valid when nullEnds is true', () => {
                        expect($service.validate(item, nullEndsConfig)).toBeTruthy();
                    });
                });

                describe('items with 1 schedule with a null end', () => {
                    let item = [
                        { day: 0, start: 300, end: null, value: true }
                    ];

                    it('as invalid when nullEnds is false', () => {
                        expect($service.validate(item, noNullEndsConfig)).toBeFalsy();
                    });

                    it('as valid when nullEnds is true', () => {
                        expect($service.validate(item, nullEndsConfig)).toBeTruthy();
                    });
                });

                describe('items with 1 schedule with a non-null end', () => {
                    let item = [
                        { day: 0, start: 300, end: 600, value: true }
                    ];

                    it('as valid when nullEnds is false', () => {
                        expect($service.validate(item, noNullEndsConfig)).toBeTruthy();
                    });

                    it('as invalid when nullEnds is true', () => {
                        expect($service.validate(item, nullEndsConfig)).toBeFalsy();
                    });
                });

                describe('items with multiple schedules with at least one having a null end', () => {
                    let item = [
                        { day: 0, start: 300, end: null, value: true },
                        { day: 0, start: 600, end: 900, value: false }
                    ];

                    it('as invalid when nullEnds is false', () => {
                        expect($service.validate(item, noNullEndsConfig)).toBeFalsy();
                    });

                    it('as invalid when nullEnds is true', () => {
                        expect($service.validate(item, nullEndsConfig)).toBeFalsy();
                    });
                });

            });
        });
    }
}