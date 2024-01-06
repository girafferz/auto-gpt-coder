#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { defineCommand, processMainCommand } from "./cmd/cmdParseGptResponse";

const scriptName = "./auto-gpt-coder-os";
// @ts-ignore
const argv = yargs(hideBin(process.argv))
  .scriptName(scriptName)
  .usage(`Usage: ${scriptName} COMMAND  [OPTIONS]`)
  .version("version", "1.0.1")
  .command("parse", "parse GPT response", defineCommand, processMainCommand)
  .strictCommands()
  .recommendCommands()
  .demandCommand(1, "You need to specify a command.")
  .help()
  .wrap(yargs(process.argv).terminalWidth()).argv;

