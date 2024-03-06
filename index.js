const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  const repository = core.getInput('repository');
  const branch = core.getInput('branch');
  const path = core.getInput('path');

  try {
    await exec.exec('git', ['config', '--global', 'user.email', 'actions@github.com']);
    await exec.exec('git', ['config', '--global', 'user.name', 'GitHub Actions']);

    await exec.exec('git', ['clone', '--branch', branch, repository], { cwd: process.env.GITHUB_WORKSPACE });

    process.chdir(`${process.env.GITHUB_WORKSPACE}/${repository}`);
    await exec.exec('npm', ['ci']);
    await exec.exec('npm', ['run', 'build']);

    await exec.exec('mv', ['build', path]);
    await exec.exec('cd', [path]);

    await exec.exec('git', ['init']);
    await exec.exec('git', ['remote', 'add', 'origin', '+https://' + core.getInput('github_token') + '@github.com/' + repository]);
    await exec.exec('git', ['fetch', 'origin', '+gh-pages:refs/heads/gh-pages']);
    await exec.exec('git', ['checkout', 'gh-pages']);
    await exec.exec('git', ['rm', '-rf', '.'], {
      ignoreReturnCode: true
    });
    await exec.exec('git', ['add', '-A']);
    await exec.exec('git', ['commit', '-m', 'Update gh-pages']);
    await exec.exec('git', ['push', '-q', 'origin', 'gh-pages']);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
