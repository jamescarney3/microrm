import * as fs from 'fs/promises';
import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';

const main = async () => {
  // GET COVERAGE SUMMARIES
  const token = core.getInput('token');
  const threshold = core.getInput('threshold');
  const baseSummary = core.getInput('base-summary');
  const headSummary = core.getInput('head-summary');

  const baseSummaryPath = path.resolve(baseSummary);
  const headSummaryPath = path.resolve(headSummary);

  const baseCoverageContent = await fs.readFile(baseSummaryPath, { encoding: 'utf8' });
  const baseCoverage = JSON.parse(baseCoverageContent);

  const headCoverageContent = await fs.readFile(headSummaryPath, { encoding: 'utf8' });
  const headCoverage = JSON.parse(headCoverageContent);

  const baseLines = baseCoverage.total.lines.pct;
  const headLines = headCoverage.total.lines.pct;
  const baseStatements = baseCoverage.total.statements.pct;
  const headStatements = headCoverage.total.statements.pct;
  const baseFunctions = baseCoverage.total.functions.pct;
  const headFunctions = headCoverage.total.functions.pct;
  const baseBranches = baseCoverage.total.branches.pct;
  const headBranches = headCoverage.total.branches.pct;

  // TELL ME ABOUT EM
  const prNumber = github.context.payload?.pull_request?.number;
  const commentFlag = '<!-- compare-coverage -->';
  const octokit = github.getOctokit(token);

  // GET THE COMMENTS FOR THIS PR
  const commentsResponse = await octokit.rest.issues.listComments({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
  });

  // FIND THE PREVIOUS ONE OF THESE COMMENTS
  const coverageComment = commentsResponse.data.find((comment) => comment.body.includes(commentFlag));
  if (coverageComment) {
    octokit.rest.issues.deleteComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      comment_id: coverageComment.id,
    });
  }

  const formatPct = (pct) => {
    const indicator = !!threshold ? (pct < 0 ? '&#128308;' : '&#128994;') : '';
    return `${[indicator, pct].join(' ')}%`;
  };

  const formatDiff = (basePct, headPct) => {
    const diff = headPct - basePct;
    if (!threshold) {
      return diff < 0 ? `&#128993; -${diff}%` : `&#128994; +${diff}%`;
    } else {
      if (diff >= 0) {
        return `&#128994; +${diff}%`;
      } else if (headPct > threshold) {
        return `&#128993; -${diff}%`;
      } else {
        return `&#128993; -${diff}%`;
      }
    }
  };

  // MAKE A COMMENT
  const commentBody = `
${commentFlag}
# coverage differential
|            | base ref          | head ref          | diff              |
| ---------- | ----------------- | ----------------- | ----------------- |
| lines      | ${formatPct(baseLines)}      | ${formatPct(headLines)}      | ${formatDiff(baseLines, headLines)}      |
| statements | ${formatPct(baseStatements)} | ${formatPct(headStatements)} | ${formatDiff(baseStatements, headStatements)} |
| functions  | ${formatPct(baseFunctions)}  | ${formatPct(headFunctions)}  | ${formatDiff(baseFunctions, headFunctions)}  |
| branches   | ${formatPct(baseBranches)}   | ${formatPct(headBranches)}   | ${formatDiff(baseBranches, headBranches)}   |
  `;
  octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    body: commentBody,
  });
};

main().catch((err) => core.setFailed(`Action failed with error ${err}`));
