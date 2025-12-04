import fs from "fs";
import { faker } from "@faker-js/faker";

const numRows = 100000;
const outputFile = "employees_large.csv";

const positions = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "QA Engineer",
  "DevOps Engineer",
];

const header = "name,age,position,salary";
fs.writeFileSync(outputFile, header);

for (let i = 1; i <= numRows; i++) {
  const name = faker.person.fullName();
  const age = faker.number.int({ min: 22, max: 45 });
  const position =
    positions[faker.number.int({ min: 0, max: positions.length - 1 })];
  const salary = faker.number.int({ min: 4000000, max: 10000000 });

  const row = `${name},${age},${position},${salary}\n`;
  fs.appendFileSync(outputFile, row);
}

console.log(
  `✅ CSV besar dengan ${numRows} baris berhasil dibuat: ${outputFile}`,
);
