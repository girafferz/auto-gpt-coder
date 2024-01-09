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
      `I'll just run the command you provided by shell. Please ` +
      `reply just command with comment . If there is anything you want to know, ` +
      `please reply me the command you want me to execute.` +
      ` use \`\`\`bash \`\`\`enclose the command.  reply executable string by shell`,
  });
}

const applyPatchFromFileContent = async (
  patchFilePath: string,
): Promise<{ stdout: string; stderr: string }> => {
  const patchContent = readFileSync(patchFilePath, 'utf8');
  console.log('__mainProcess.ts__27__', patchContent);
  const bashScriptRegex = /```bash([\s\S]*?)```/m;
  const match = patchContent.match(bashScriptRegex);
  if (!match || !match[1]) {
    return {
      stdout: '',
      stderr:
        'No bash script found in the patch content. please give me bash script enclosed by ```bash```',
    };
  }
  const bashScript = match[1].trim();

  try {
    const { stdout, stderr } = await exec(bashScript);
    // Return both the standard output and the error output
    return { stdout, stderr };
  } catch (error) {
    return { stdout: '', stderr: error };
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
    // git diffをGPTに送る
    // const { stdout: diff } = await exec('git diff');
    // messages.push({
    //   role: 'user',
    //   content: 'This is the git diff of the project now editing:\n' + diff,
    // });

    // errorをGPTに送る
    console.log('__mainProcess.ts__81__');
    messages.push({
      role: 'user',
      content: 'ERROR is :\n' + JSON.stringify(error),
    });
    console.log('__mainProcess.ts__85__');

    let stdoutStr = '';
    let stderrStr = '';

    addBasePrompt(messages);
    console.log('__mainProcess.ts__91__');
    const responseData = await fetchGPT3Response(messages);
    console.log('__executeCode.ts__12__', responseData);
    const patchFilePath = await saveMessageContent(responseData, 0);

    const applyResult = await applyPatchFromFileContent(patchFilePath);
    stdoutStr = applyResult.stdout;
    stderrStr = applyResult.stderr;

    // 3回繰り返す
    for (let i = 1; i < 10; i++) {
      messages.push({
        role: 'user',
        content: `I executed your command provided by your reply. result is stdout:${stdoutStr} stderr:${stderrStr}`,
      });
      console.log('__mainProcess.ts__88__', stdoutStr, stderrStr);
      addBasePrompt(messages);
      const responseData = await fetchGPT3Response(messages);
      const patchFilePath = await saveMessageContent(responseData, i);
      const applyResult = await applyPatchFromFileContent(patchFilePath);
      stdoutStr = applyResult.stdout;
      stderrStr = applyResult.stderr;
      await sleep(3000);
      console.log('__mainProcess.ts__95__');
    }
    console.log('__mainProcess.ts__99__', messages);
  }
};
