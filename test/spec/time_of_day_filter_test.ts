export class TimeOfDayFilterTests {
    static run() {
        describe('time of day filter', function () {
            var timeOfDayFilter;

            beforeEach(inject(function (_brWeeklySchedulerTimeOfDayFilter_) {
                timeOfDayFilter = _brWeeklySchedulerTimeOfDayFilter_;
            }));

            function testDisplay(value) {
                let input = value[0];
                let expectedOutput = value[1];

                describe('with value ' + input, function () {
                    it('should match ' + expectedOutput, function () {
                        expect(timeOfDayFilter(input)).toBe(expectedOutput);
                    });
                });
            }

            describe('should display times correctly', function () {
                var testCases = [
                    [0, '12:00A'],
                    [60, '12:01A'],
                    [22500, '6:15A'],
                    [22530, '6:15:30A'],
                    [43200, '12:00P'],
                    [54000, '3:00P'],
                    [86340, '11:59P'],
                    [86400, '12:00A'],
                    [86430, '12:00:30A']
                ];

                testCases.forEach(function (testCase) {
                    testDisplay(testCase);
                });
            });
        });
    }
}
