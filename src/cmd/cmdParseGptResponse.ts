import { Arguments, Argv } from "yargs";
import { ParseArgs } from "../types";
import { LogUtils } from "../utils/Logger";
import { main } from "../execute/executeCode";

export const defineCommand = (yargs: Argv) => {
  return yargs.options({
    input: {
      alias: "i",
      description: "Input file",
      requiresArg: true,
      required: true,
    },
    output: {
      alias: "o",
      description: "Output file",
      requiresArg: true,
      required: true,
    },
  });
};

export const processMainCommand = async (argv: Arguments<ParseArgs>) => {
  try {
    await main(argv);
  } catch (error) {
    const Logger = new LogUtils("logs", "log-parse/log-error.txt");
    console.log(error);
    Logger.log("error", `${error}`);
  }
};
