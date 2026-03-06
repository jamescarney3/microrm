import * as fs from 'fs/promises';
import * as path from 'path';
import * as core from '@actions/core';
import { badgen } from 'badgen';

const main = async () => {
  // given a summary from the action config and workflow, read the json coverage
  // summary file, deserialize, and get total line coverage percentage
  const summary = core.getInput('summary');
  const summaryPath = path.resolve(summary);
  const summaryContent = await fs.readFile(summaryPath, { encoding: 'utf8' });
  const coverage = JSON.parse(summaryContent);
  const lines = coverage.total.lines.pct;

  // choose a color based on coverage thresholds
  let statusColor = 'red';
  if (lines >= 70) statusColor = 'orange';
  if (lines >= 80) statusColor = 'yellow';
  if (lines >= 90) statusColor = 'green';

  // generate badge svg file with badgen and write it to the current working dir
  const svgString = badgen({
    label: 'Coverage',
    status: `${lines}%`,
    color: statusColor,
  });
  await fs.writeFile('./coverage.svg', svgString);
};

// invoke the function
main().catch((err) => core.setFailed(`Action failed with error ${err}`));
