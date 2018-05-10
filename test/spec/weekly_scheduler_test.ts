describe('weekly scheduler', () => {
    let $compile: angular.ICompileService;
    let $element: angular.IAugmentedJQuery;
    let element: Element;
    let $rootScope: angular.IRootScopeService;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(() => {
        $element = $compile('<weekly-scheduler items="[]" options="{}">')($rootScope);
        element = $element[0];
        $rootScope.$digest();
    });

    describe('should render', () => {
        it('itself', () => {
            expect($element).toBeTruthy();
            expect(element).toBeTruthy();
        });

        describe('24 hours worth of time slots: ', () => {
            let timeslots = [
                '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12a',
                '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p',
            ];

            angular.forEach(timeslots, (timeslot) => {
                describe(timeslot, () => {
                    it('renders', () => {
                        expect($element.text()).toContain(timeslot);
                    });
                });
            });
        });
    });
});
