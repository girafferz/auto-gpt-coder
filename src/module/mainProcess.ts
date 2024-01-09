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
      `I'll just run the command you provided by shell. Please reply just command only and info by commentouted . If there is anything you want to know, please tell me the command you want me to execute.`,
  });
}

const applyPatchFromFileContent = async (
  patchFilePath: string,
): Promise<{ stdout: string; stderr: string }> => {
  const patchContent = readFileSync(patchFilePath, 'utf8');
  try {
    const { stdout, stderr } = await exec(`${patchContent}`);
    // Return both the standard output and the error output
    return { stdout, stderr };
  } catch (error) {
    return { stdout: '', stderr: error };
  }
};

async function makePatchFile(responseData, i: number) {
  let messageContent = '';
  if (!responseData.choices) {
    messageContent = '';
  } else {
    messageContent = responseData.choices[0].message.content;
  }
  const patchFilePath = `./output/${i}.patch`;
  await writeFile(patchFilePath, messageContent, 'utf8');
  return patchFilePath;
}

// testを実行してエラーになったらGPTに送る
export const runTestsAndProcessErrors = async () => {
  const messages: Message[] = [];

  try {
    const testCommand = 'npm run auto-test'; // 例：Jestを使用する場合
    // テストコマンドの実行
    const { stdout, stderr } = await exec(testCommand);
    // 標準出力と標準エラー出力のキャプチャ
    console.log('標準出力:', stdout);
    console.error('標準エラー出力:', stderr);
  } catch (error) {
    // git diffをGPTに送る
    const { stdout: diff } = await exec('git diff');
    messages.push({
      role: 'user',
      content: 'This is the git diff of the project now editing:\n' + diff,
    });

    // errorをGPTに送る
    messages.push({
      role: 'user',
      content: 'ERROR is :\n' + JSON.stringify(error),
    });

    let stdoutStr = '';
    let stderrStr = '';

    addBasePrompt(messages);
    const responseData = await fetchGPT3Response(messages);
    console.log('__executeCode.ts__12__', responseData);
    const patchFilePath = await makePatchFile(responseData, 0);

    const applyResult = await applyPatchFromFileContent(patchFilePath);
    stdoutStr = applyResult.stdout;
    stderrStr = applyResult.stderr;

    // 3回繰り返す
    for (let i = 1; i < 10; i++) {
      messages.push({
        role: 'user',
        content: `stdout:${stdoutStr} stderr:${stderrStr}`,
      });
      addBasePrompt(messages);
      const responseData = await fetchGPT3Response(messages);
      const patchFilePath = await makePatchFile(responseData, i);
      const applyResult = await applyPatchFromFileContent(patchFilePath);
      stdoutStr = applyResult.stdout;
      stderrStr = applyResult.stderr;
      await sleep(3000);
    }
  }
};
