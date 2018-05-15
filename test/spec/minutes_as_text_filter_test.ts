describe('minutes as text filter', function() {
    var $filter;

    beforeEach(angular.mock.module('demoApp'));

    beforeEach(inject(function(_brWeeklySchedulerMinutesAsTextFilter_) {
        $filter = _brWeeklySchedulerMinutesAsTextFilter_;
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
            [0, 'none'],
            [1, '1 minute'],
            [375, '6 hours 15 minutes'],
            [720, '12 hours'],
            [900, '15 hours'],
            [1439, '23 hours 59 minutes'],
            [1440, '24 hours']
        ];

        testCases.forEach(function(testCase) {
            testDisplay(testCase);
        });
    });
});
