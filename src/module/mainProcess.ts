import fetchGPT3Response, { Message } from '../utils/gpt3Service';
import * as util from 'util';

const exec = util.promisify(require('child_process').exec);
export const runTestsAndProcessErrors = async () => {
  const messages: Message[] = [];
  messages.push({
    role: 'system',
    content:
      'You are a code patch generator, I will send you a code diff and standard logs and error logs. please reply by patch file for fix the error. code is typescript. and please fix escape backslash for run.',
  });

  try {
    const testCommand = 'npm run auto-test'; // 例：Jestを使用する場合
    // テストコマンドの実行
    const { stdout, stderr } = await exec(testCommand);
    // 標準出力と標準エラー出力のキャプチャ
    console.log('標準出力:', stdout);
    console.error('標準エラー出力:', stderr);
  } catch (error) {
    // console.log("__executeCode.ts__10__", error)
    messages.push({
      role: 'user',
      content: JSON.stringify(error),
    });

    for (let i = 0; i < 3; i++) {
      const responseData = await fetchGPT3Response(messages);
      console.log('__executeCode.ts__12__', responseData);

      console.log('__mainProcess.ts__30__');
      messages.push({
        role: 'user',
        content: JSON.stringify(responseData.choices[0].message.content),
      });
    }
    console.log('__mainProcess.ts__35__', messages);
  }
};
