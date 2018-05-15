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
            [0, '12:00A'],
            [1, '12:01A'],
            [375, '6:15A'],
            [720, '12:00P'],
            [900, '3:00P'],
            [1439, '11:59P'],
            [1440, '12:00A']
        ];

        testCases.forEach(function(testCase) {
            testDisplay(testCase);
        });
    });
});
