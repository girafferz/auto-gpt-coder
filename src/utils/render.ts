// import { marked } from 'marked';
// import TerminalRenderer from 'marked-terminal';
//
// // Set the markdown renderer to use marked-terminal
// marked.setOptions({
//   // Define custom renderer
//   renderer: new TerminalRenderer(),
// });
//
// // Your markdown content
// const content =
//   '"Here is the patch file to fix the error in the code:\\n\\n```\\n--- a/specs/sample.spec.ts\\n+++ b/specs/sample.spec.ts\\n@@ -4,6 +4,7 @@\\n   it(\'should run tests and process errors\', async () => {\\n     console.error = jest.fn();\\n     console.log(\\"__sample.spec.ts__6__\\");\\n+    console.error(\\"sample error\\");\\n\\n-    throw new Error(\\"sample error\\");\\n\\n     await new Promise(resolve => setTimeout(resolve, 1000));\\n   });\\n```\\n\\nThis patch will replace the current code in the `sample.spec.ts` file and fix the error by replacing the line:\\n\\n```\\nthrow new Error(\\"sample error\\");\\n```\\n\\nwith:\\n\\n```\\nconsole.error(\\"sample error\\");\\n```\\n\\nThis will prevent the error from being thrown and instead log the error message using `console.error`.\\n\\nPlease let me know if you need any further assistance."';
//
// const formattedContent = content.replace(/\\n/g, '\n');
//
// console.log(marked(formattedContent));
