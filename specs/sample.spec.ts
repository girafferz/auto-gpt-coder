describe('sample', () => {
it('should run tests and process errors', async () => {
        // We mock console methods to ensure they were called as expected
        console.log = jest.fn();
        console.error = jest.fn();
        console.log("__sample.spec.ts__6__")
    throw new Error("sample error");

        await new Promise(resolve => setTimeout(resolve, 1000));

    },1000000);

});