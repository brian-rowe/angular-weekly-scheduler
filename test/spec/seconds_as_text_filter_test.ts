export class SecondsAsTextFilterTests {
    static run() {
        describe('seconds as text filter', function () {
            var $filter;

            beforeEach(inject(function (_rrWeeklySchedulerSecondsAsTextFilter_) {
                $filter = _rrWeeklySchedulerSecondsAsTextFilter_;
            }));

            function testDisplay(value) {
                let input = value[0];
                let expectedOutput = value[1];

                describe('with value ' + input, function () {
                    it('should match ' + expectedOutput, function () {
                        expect($filter(input)).toBe(expectedOutput);
                    });
                });
            }

            describe('should display times correctly', function () {
                var testCases = [
                    [0, 'none'],
                    [1, '1 second'],
                    [5, '5 seconds'],
                    [60, '1 minute'],
                    [22500, '6 hours 15 minutes'],
                    [22501, '6 hours 15 minutes 1 second'],
                    [22530, '6 hours 15 minutes 30 seconds'],
                    [43200, '12 hours'],
                    [54000, '15 hours'],
                    [54030, '15 hours 30 seconds'],
                    [86340, '23 hours 59 minutes'],
                    [86400, '24 hours']
                ];

                testCases.forEach(function (testCase) {
                    testDisplay(testCase);
                });
            });
        });
    }
}
