// npm run auto-test から起動されるサンプルのテストコード

import { Sample } from '../src/module/sample';

describe('sample', () => {
    it('should run tests and process errors', async () => {
        const target = new Sample();
        target.execute();
    },1000000);
});