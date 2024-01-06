import {ValidatorCode} from "../types";
import * as dotenv from 'dotenv';
import {runTestsAndProcessErrors} from "../module/mainProcess";

dotenv.config();

// @ts-ignore
export const main = async (argv: ValidatorCode) => {
  await runTestsAndProcessErrors();
};