import fetchGPT3Response, { Message } from '../utils/gpt3Service';
import * as util from 'util';
import * as fs from 'fs';
import { promisify } from 'util';
import { readFileSync } from 'fs';

const exec = util.promisify(require('child_process').exec);
const writeFile = promisify(fs.writeFile);

function addBasePrompt(messages: Message[]) {
  messages.push({
    role: 'system',
    content:
      `You are a senior engineer and I am a junior engineer.` +
      `I'll just run the command you upvoted. Please enclose commands in \`\`\`\` and \`\`\`\`. If there is anything you want to know, please tell me the command you want me to execute.`,
  });
}

const applyPatchFromFileContent = async (patchFilePath: string) => {
  const patchContent = readFileSync(patchFilePath, 'utf8');
  // １行目のコメントに書いてあるパスに対して、patchContentを書き込む
  // Extract file path from the first uncommented line
  const firstLine = patchContent.split('\n')[0];
  const match = firstLine.match(/^\/\/\s?(.+)/);
  if (match) {
    const filePath = match[1];
    // Make sure the file exists
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, patchContent);
    } else {
      throw new Error(`File "${filePath}" does not exist.`);
    }
  } else {
    throw new Error('No file path comment found in the patch content.');
  }
};

async function makePatchFile(responseData) {
  const messageContent = responseData.choices[0].message.content;
  const patchRegex = /```typescript([\s\S]+?)```/;
  const patchMatch = messageContent.match(patchRegex);
  const patchFilePath = `./output/${1}.patch`;
  // Write responseData to patch file
  // Ensure the output directory exists
  let patchContent = '';
  if (patchMatch && patchMatch[1]) {
    // ```typescript content``` の時
    patchContent = patchMatch[1];
  } else {
    // ``` content``` の時
    const patchRegex = /```([\s\S]+?)```/;
    const patchMatch2 = messageContent.match(patchRegex);
    if (patchMatch2 && patchMatch2[1]) {
      // ```content``` の時
      patchContent = patchMatch2[1];
    } else {
      // ```が何もない時
      patchContent = messageContent;
    }
  }

  // Now, you can write patchContent to a file
  fs.mkdirSync('output', { recursive: true });
  await writeFile(patchFilePath, patchContent, 'utf8');
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
    // const { stdout: diff } = await exec('git diff');
    // messages.push({
    //   role: 'user',
    //   content: 'This is the git diff of the project now editing:\n' + diff,
    // });

    // errorをGPTに送る
    messages.push({
      role: 'user',
      content: 'ERROR is :\n' + JSON.stringify(error),
    });

    addBasePrompt(messages);
    const responseData = await fetchGPT3Response(messages);
    console.log('__executeCode.ts__12__', responseData);
    const patchFilePath = await makePatchFile(responseData);

    await applyPatchFromFileContent(patchFilePath);

    // 3回繰り返す
    for (let i = 0; i < 3; i++) {}
  }
};
