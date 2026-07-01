import fs from 'node:fs';
import { spawn } from 'node:child_process';

const file = process.argv[2] || 'data/midwest-city-resources.json';
const resources = JSON.parse(fs.readFileSync(file, 'utf8'));
const urls = [...new Set(resources.flatMap((resource) => [resource.website, resource.sourceUrl]).filter(Boolean))];
const failures = [];

function checkUrl(url) {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['--head', '--location', '--silent', '--show-error', '--max-time', '15', '--output', '/dev/null', '--write-out', '%{http_code}', url]);
    let stdout = '';
    let stderr = '';
    curl.stdout.on('data', (chunk) => { stdout += chunk; });
    curl.stderr.on('data', (chunk) => { stderr += chunk; });
    curl.on('close', (code) => {
      const status = Number(stdout.trim().slice(-3));
      if (code === 0 && status >= 200 && status < 400) return resolve(null);
      if (status === 403 || status === 405) {
        const get = spawn('curl', ['--get', '--location', '--silent', '--show-error', '--max-time', '15', '--output', '/dev/null', '--write-out', '%{http_code}', url]);
        let getStdout = '';
        let getStderr = '';
        get.stdout.on('data', (chunk) => { getStdout += chunk; });
        get.stderr.on('data', (chunk) => { getStderr += chunk; });
        get.on('close', (getCode) => {
          const getStatus = Number(getStdout.trim().slice(-3));
          resolve(getCode === 0 && getStatus >= 200 && getStatus < 400 ? null : `${getStatus || getCode} ${url}${getStderr ? ` (${getStderr.trim()})` : ''}`);
        });
        return;
      }
      resolve(`${status || code} ${url}${stderr ? ` (${stderr.trim()})` : ''}`);
    });
  });
}

for (const url of urls) {
  const failure = await checkUrl(url);
  if (failure) failures.push(failure);
}

if (failures.length) {
  console.error(`Broken-link check found ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Checked ${urls.length} unique resource links successfully.`);
