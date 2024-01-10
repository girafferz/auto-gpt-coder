import fetchGPT3Response, { Message } from '../utils/gpt3Service';
import * as util from 'util';
import * as fs from 'fs';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { sleep } from '../utils';

const exec = util.promisify(require('child_process').exec);
const writeFile = promisify(fs.writeFile);

function addBasePrompt(messages: Message[]) {
  messages.push({
    role: 'system',
    content:
      `You are a senior engineer and I am a junior engineer.` +
      `I just  Copy and paste the code from you.` +
      `Please do not omit the entire code and reply.` +
      ` use \`\`\`typescript \`\`\`enclose the command.`,
  });
}

const applyPatchFromFileContent = async (
  patchFilePath: string,
  targetFilePath: string,
): Promise<void> => {
  const patchContent = readFileSync(patchFilePath, 'utf8');
  console.log('__mainProcess.ts__27__', patchContent);
  const typescriptContent = /```typescript([\s\S]*?)```/m;
  const match = patchContent.match(typescriptContent);
  if (!match || !match[1]) {
    return;
  }
  const typescriptCode = match[1].trim();

  // targetFilePathのcodeか判定する
  const result = await fetchGPT3Response([
    {
      role: 'user',
      content: `is this ${targetFilePath} code ?? >>>> ${typescriptCode} \n\n if so please reply "yes"`,
    },
  ]);
  const checkFlagContent = result.choices[0].message.content;
  if (!checkFlagContent.toLowerCase().includes('yes')) {
    console.log('__mainProcess.ts__44__', checkFlagContent);
    return;
  }

  try {
    console.log('__mainProcess.ts__42__BASH typescriptCode', typescriptCode);
    fs.writeFileSync(targetFilePath, typescriptCode);
  } catch (error) {
    console.log('__mainProcess.ts__39__', error.message);
  }
};

async function saveMessageContent(responseData, i: number) {
  let messageContent = '';
  if (!responseData.choices) {
    messageContent = '';
  } else {
    messageContent = responseData.choices[0].message.content;
  }
  console.log('__mainProcess.ts__55__', messageContent);
  const patchFilePath = `./output/${i}.patch`;
  await writeFile(patchFilePath, messageContent, 'utf8');
  return patchFilePath;
}

// testを実行してエラーになったらGPTに送る
export const runTestsAndProcessErrors = async () => {
  const messages: Message[] = [];
  console.log('__mainProcess.ts__64__');
  // return;

  try {
    const testCommand = 'npm run auto-test'; // 例：Jestを使用する場合
    // テストコマンドの実行
    const { stdout, stderr } = await exec(testCommand);
    // 標準出力と標準エラー出力のキャプチャ
    console.log('標準出力:', stdout);
    console.error('標準エラー出力:', stderr);
  } catch (error) {
    const targetFilePath = 'src/module/sample.ts';
    // git diffをGPTに送る
    const { stdout: diff } = await exec('git diff ' + targetFilePath);
    const { stdout: fileContent } = await exec('cat ' + targetFilePath);
    console.log('__mainProcess.ts__80__', fileContent);
    messages.push({
      role: 'user',
      content: 'This is the git diff of the project now editing:\n' + diff,
    });
    messages.push({
      role: 'user',
      content: 'This is the file content now editing:\n' + fileContent,
    });

    // errorをGPTに送る
    console.log('__mainProcess.ts__81__');
    messages.push({
      role: 'user',
      content: 'ERROR is :\n' + JSON.stringify(error),
    });
    console.log('__mainProcess.ts__85__');

    const stdoutStr = '';
    const stderrStr = '';

    addBasePrompt(messages);
    console.log('__mainProcess.ts__91__');
    const responseData = await fetchGPT3Response(messages);
    console.log('__executeCode.ts__12__', responseData);
    const patchFilePath = await saveMessageContent(responseData, 0);

    await applyPatchFromFileContent(patchFilePath, targetFilePath);

    // 繰り返す
    for (let i = 1; i < 5; i++) {
      const testCommand = 'npm run auto-test'; // 例：Jestを使用する場合
      // テストコマンドの実行
      let stdoutStr = '';
      let stderrStr = '';
      let unitTesterror = '';
      try {
        const { stdout, stderr } = await exec(testCommand);
        stdoutStr = stdout;
        stderrStr = stderr;
      } catch (e) {
        unitTesterror = e.message;
      }

      messages.push({
        role: 'user',
        content: `I executed your typescript code provided by your reply. result is stdout:${stdoutStr} stderr:${stderrStr}, unit-test error: ${unitTesterror}`,
      });
      console.log('__mainProcess.ts__88__', stdoutStr, stderrStr);

      // addBasePrompt(messages);
      const responseData = await fetchGPT3Response(messages);
      const patchFilePath = await saveMessageContent(responseData, i);
      await applyPatchFromFileContent(patchFilePath, targetFilePath);
      await sleep(3000);
      console.log('__mainProcess.ts__95__');
    }
    console.log('__mainProcess.ts__99__', messages);
  }
};
