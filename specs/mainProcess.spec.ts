import {runTestsAndProcessErrors} from '../src/module/mainProcess'; // update with your actual filename

describe('runTestsAndProcessErrors', () => {
    // 開発時はここを実行する
    it('should run tests and process errors', async () => {
        console.log("__mainProcess.spec.ts__6__")
        // mainを処理を起動
        await runTestsAndProcessErrors();
        console.log("__mainProcess.spec.ts__12__")

    },100000000);
});