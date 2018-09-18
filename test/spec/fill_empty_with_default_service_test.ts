/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory.ts" />
/// <reference path="../../app/ng-weekly-scheduler/fill-empty-with-default/FillEmptyWithDefaultService.ts" />

describe('fillEmptyWithDefault service', () => {
    var $itemFactory: WeeklySchedulerItemFactory;
    var $service: FillEmptyWithDefaultService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerItemFactory_, _brWeeklySchedulerFillEmptyWithDefaultService_) {
        $itemFactory = _brWeeklySchedulerItemFactory_;
        $service = _brWeeklySchedulerFillEmptyWithDefaultService_;
    }));

    describe('fill', () => {
        let createItem = (day, schedules) => {
            return { day: day, schedules: schedules }
        };

        let config = {
            createItem: createItem,
            defaultValue: false,
            maxValue: 1440,
            hourCount: 24,
            intervalCount: 96
        }

        describe('should work when', () => {
            it('there are no starting schedules', () => {
                let item = $itemFactory.createItem(config, 0, []);

                let expectedResult = $itemFactory.createItem(config, 0,  [
                    { day: 0, start: 0, end: 0, value: config.defaultValue }
                ]);
    
                let actualResult = $service.fill(item, config);
    
                expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();  
            });

            describe('there is only one starting schedule', () => {
                it('that starts at 0', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 0, end: 720, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 720, value: true },
                        { day: 0, start: 720, end: 0, value: config.defaultValue },
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy(); 
                });

                it('that starts & ends in the middle', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 180, end: 720, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 180, value: config.defaultValue },
                        { day: 0, start: 180, end: 720, value: true },
                        { day: 0, start: 720, end: 0, value: config.defaultValue },
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy(); 
                });

                it ('that ends at 0', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 720, end: 0, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 720, value: config.defaultValue },
                        { day: 0, start: 720, end: 0, value: true },
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy(); 
                });
            });

            it('there are two starting schedules', () => {
                let item = $itemFactory.createItem(config, 0, [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 780, end: 0, value: true }
                ]);
    
                let expectedResult = $itemFactory.createItem(config, 0,  [
                    { day: 0, start: 0, end: 720, value: true },
                    { day: 0, start: 720, end: 780, value: config.defaultValue },
                    { day: 0, start: 780, end: 0, value: true },
                ]);
    
                let actualResult = $service.fill(item, config);
    
                expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();
            });

            describe('there are three or more starting schedules', () => {
                it('that start and end on the extremes', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 0, end: 75, value: true },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 1410, end: 0, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 75, value: true },
                        { day: 0, start: 75, end: 330, value: false },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 840, end: 1410, value: false },
                        { day: 0, start: 1410, end: 0, value: true }
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();
                });

                it('that do not start at 0', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 30, end: 75, value: true },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 1410, end: 0, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 30, value: false },
                        { day: 0, start: 30, end: 75, value: true },
                        { day: 0, start: 75, end: 330, value: false },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 840, end: 1410, value: false },
                        { day: 0, start: 1410, end: 0, value: true }
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();
                });

                it('that do not end at 0', () => {
                    let item = $itemFactory.createItem(config, 0, [
                        { day: 0, start: 0, end: 75, value: true },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 1410, end: 1425, value: true }
                    ]);
        
                    let expectedResult = $itemFactory.createItem(config, 0,  [
                        { day: 0, start: 0, end: 75, value: true },
                        { day: 0, start: 75, end: 330, value: false },
                        { day: 0, start: 330, end: 840, value: true },
                        { day: 0, start: 840, end: 1410, value: false },
                        { day: 0, start: 1410, end: 1425, value: true },
                        { day: 0, start: 1425, end: 0, value: false }
                    ]);
        
                    let actualResult = $service.fill(item, config);
        
                    expect(angular.equals(actualResult, expectedResult.schedules)).toBeTruthy();
                });
            });
        });
    });
});
