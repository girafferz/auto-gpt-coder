export interface ValidatorCode {
  input: string;
  output: string;
}

export interface ParseArgs {
  input: string;
  output: string;
}

// TODO 色んな言語用意
export const devRolePrompt = "I want you to act as a code patch generater bot." +
    " I will type typescript code and you will reply with code patch what the javascript console should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when I need to tell you something in english, I will do so by putting text inside curly brackets {like this}. My first command is console.log(\"Hello World\");"