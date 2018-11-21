describe('seconds as text filter', function() {
    var $filter;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerSecondsAsTextFilter_) {
        $filter = _brWeeklySchedulerSecondsAsTextFilter_;
    }));

    function testDisplay(value) {
        let input = value[0];
        let expectedOutput = value[1];

        describe('with value ' + input, function() {
            it('should match ' + expectedOutput, function() {
                expect($filter(input)).toBe(expectedOutput);
            });
        });
    }

    describe('should display times correctly', function() {
        var testCases = [
            [0 * 60, 'none'],
            [5, '5 seconds'],
            [1 * 60, '1 minute'],
            [375 * 60, '6 hours 15 minutes'],
            [(375 * 60) + 30, '6 hours 15 minutes 30 seconds'],
            [720 * 60, '12 hours'],
            [900 * 60, '15 hours'],
            [(900 * 60) + 30, '15 hours 30 seconds'],
            [1439 * 60, '23 hours 59 minutes'],
            [1440 * 60, '24 hours']
        ];

        testCases.forEach(function(testCase) {
            testDisplay(testCase);
        });
    });
});
