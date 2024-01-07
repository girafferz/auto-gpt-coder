describe('sample', () => {
it('should run tests and process errors', async () => {
        // We mock console methods to ensure they were called as expected
        console.log = jest.fn();
        console.error = jest.fn();
expect(console.error).toHaveBeenCalledTimes(1);
expect(console.error).toHaveBeenCalledWith("sample error");
throw new Error("sample error");
    throw new Error("sample error");

        await new Promise(resolve => setTimeout(resolve, 1000));

    },1000000);

});