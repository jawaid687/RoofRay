import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Robust cross-platform Chrome / Chromium executable locator.
 * Respects process.env.CHROME_PATH and scans standard OS installation paths.
 */
export function resolveChromePath(envOverride?: string): string {
  const candidateEnv = envOverride !== undefined ? envOverride : process.env.CHROME_PATH;
  if (candidateEnv && candidateEnv.trim().length > 0) {
    const trimmed = candidateEnv.trim();
    if (fs.existsSync(trimmed)) {
      return trimmed;
    }
  }

  const platform = os.platform();

  if (platform === 'linux') {
    const linuxCandidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/snap/bin/google-chrome',
      '/usr/local/bin/google-chrome',
      '/usr/local/bin/chromium',
    ];
    for (const p of linuxCandidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidateEnv || 'google-chrome';
  }

  if (platform === 'darwin') {
    const macCandidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    ];
    for (const p of macCandidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidateEnv || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  if (platform === 'win32') {
    const progFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
    const progFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env.LOCALAPPDATA || '';

    const winCandidates = [
      path.join(progFiles, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(progFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
      localAppData ? path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe') : '',
      path.join(progFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(progFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
    ].filter(Boolean);

    for (const p of winCandidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidateEnv || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }

  return candidateEnv || 'google-chrome';
}
