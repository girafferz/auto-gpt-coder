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
      'You are a code patch generator. I will provide you a code diff, standard logs, and error logs. ' +
      'Your task is to generate a patch that can be directly applied to fix the errors. ' +
      'The provided code is written in TypeScript. Please output the patch instructions only, ' +
      'with no additional explanatory text. ' +
      'I want to write a Patch file that can be applied as it is with the ' +
      'Patch command as it is to write the output response as it is.\n' +
      'patch file sample is here\n' +
      '--- a/${file_to_path}/${filename}\n' +
      '+++ b/${file_to_path}/${filename}\n' +
      '@@ -6,1 +6,1 @@\n' +
      '-console.log("__filename.spec.ts__6__");\n' +
      '+expect(console.error).toHaveBeenCalledWith("sample error");\n\n' +
      'please make patch file like this for fix error',
  });
}

async function makePatchFile(responseData) {
  const messageContent = responseData.choices[0].message.content;
  const patchRegex = /```patch([\s\S]+?)```/;
  const patchMatch = messageContent.match(patchRegex);
  const patchFilePath = `./output/${1}.patch`;
  // Write responseData to patch file
  // Ensure the output directory exists
  let patchContent = '';
  if (patchMatch && patchMatch[1]) {
    patchContent = patchMatch[1];
  } else {
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

const applyPatchFromFileContent = async (patchFilePath: string) => {
  const patchContent = readFileSync(patchFilePath, 'utf8');

  const fileRegex = /^--- a\/(.*)$/gm;

  let match: any;
  let filename: string;
  while ((match = fileRegex.exec(patchContent)) !== null) {
    if (match[1]) {
      filename = match[1];
    }

    // Run the patch command for the first file found
    if (filename) {
      break;
    }
  }

  if (filename) {
    try {
      const { stdout, stderr } = await exec(
        `patch ${filename} ${patchFilePath}`,
      );
      console.log('__mainProcess.ts__108__', filename);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    } catch (error) {
      console.error(`exec error: ${error}`);
    }
  } else {
    throw new Error('Could not extract filename from patch content.');
  }
};
