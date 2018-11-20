describe('time of day filter', function() {
    var timeOfDayFilter;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerTimeOfDayFilter_) {
        timeOfDayFilter = _brWeeklySchedulerTimeOfDayFilter_;
    }));

    function testDisplay(value) {
        let input = value[0];
        let expectedOutput = value[1];

        describe('with value ' + input, function() {
            it('should match ' + expectedOutput, function() {
                expect(timeOfDayFilter(input)).toBe(expectedOutput);
            });
        });
    }

    describe('should display times correctly', function() {
        var testCases = [
            [0 * 60, '12:00A'],
            [1 * 60, '12:01A'],
            [375 * 60, '6:15A'],
            [(375 * 60) + 30, '6:15:30A'],
            [720 * 60, '12:00P'],
            [900 * 60, '3:00P'],
            [1439 * 60, '11:59P'],
            [1440 * 60, '12:00A'],
            [(1440 * 60) + 30, '12:00:30A']
        ];

        testCases.forEach(function(testCase) {
            testDisplay(testCase);
        });
    });
});
