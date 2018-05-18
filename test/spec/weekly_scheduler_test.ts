/// <reference path="../../app/demo-app.ts" />
/// <reference path="../../app/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.ts" />

describe('weekly scheduler', () => {
    let $compile: angular.ICompileService;
    let $element: angular.IAugmentedJQuery;
    let element: Element;
    let $controller: WeeklySchedulerController;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject((_$compile_, _$componentController_, _$rootScope_,) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        ($scope as any).items = [];

        let options = {
            createItem: (day, schedules) => {
                return {
                    day: day,
                    schedules: schedules
                };
            }
        };

        let adapter = new DemoAdapter([]);

        ($scope as any).adapter = angular.copy(adapter);
        ($scope as any).options = angular.copy(options);
        
        $element = $compile('<br-weekly-scheduler adapter="adapter" options="options"></br-weekly-scheduler>')($scope);
        element = $element[0];
        $controller = _$componentController_('brWeeklyScheduler', { $element: $element, $scope: $scope }, { adapter: angular.copy(adapter), options: angular.copy(options) });
        $controller.$onInit();
        $scope.$digest();
    }));

    describe('should render', () => {
        it('itself', () => {
            expect($element).toBeTruthy();
            expect(element).toBeTruthy();
        });

        describe('24 hours: ', () => {
            let hours = [
                '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12a',
                '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p',
            ];

            angular.forEach(hours, (hour) => {
                describe(hour, () => {
                    it('renders', () => {
                        expect($element.text()).toContain(hour);
                    });
                });
            });
        });
    });

    describe('should have a full week of items', () => {
        it('when no items existed to begin with', () => {
            expect($controller.items.length).toBe(7);
        });

        it('with the correct day labels', () => {
            let days = [
                'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'
            ];

            angular.forEach(days, day => {
                expect($controller.items.filter(item => item.label === day).length).toBe(1);
            });
        });
    });
});
