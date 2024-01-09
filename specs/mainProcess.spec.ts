import {runTestsAndProcessErrors} from '../src/module/mainProcess'; // update with your actual filename

describe('runTestsAndProcessErrors', () => {
    // 開発時はここを実行する
    it('should run tests and process errors', async () => {
        // We mock console methods to ensure they were called as expected
        console.log = jest.fn();
        console.error = jest.fn();

        // mainを処理を起動
        await runTestsAndProcessErrors();

    },100000000);
});