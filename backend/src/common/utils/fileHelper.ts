import * as fs from "fs";
import * as readline from "readline";

export async function countCsvLines(filePath: string): Promise<number> {
  let lineCount = 0;

  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on("line", () => {
      lineCount++;
    });

    rl.on("close", () => {
      const actualRowCount = Math.max(0, lineCount - 1);
      resolve(actualRowCount);
    });

    fileStream.on("error", (err) => {
      reject(err);
    });
  });
}
