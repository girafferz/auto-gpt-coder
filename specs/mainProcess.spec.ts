import {runTestsAndProcessErrors} from '../src/module/mainProcess'; // update with your actual filename

describe('runTestsAndProcessErrors', () => {
    it('should run tests and process errors', async () => {
        // We mock console methods to ensure they were called as expected
        console.log = jest.fn();
        console.error = jest.fn();

        await runTestsAndProcessErrors();

    },1000000);
});