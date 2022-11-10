/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const loading = document.getElementById('loading');
const STATUS_LEVELS = ['level-0', 'level-4'];
const MAX_RETRIES = 5;
let urlInfo;

export function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  }
  return el;
}

export function getPathFromUrl(url) {
  return new URL(url).pathname;
}

export function setStatus(msg, level = 'level-4') {
  const status = document.getElementById('status');
  status.classList.remove(STATUS_LEVELS.filter((l) => l !== level));
  status.classList.add(level);
  status.innerHTML = msg;
}

export function loadingON(txt) {
  loading.classList.remove('hidden');
  setStatus(txt);
}

export function loadingOFF() {
  loading.classList.add('hidden');
}

export function stripExtension(path) {
  return path.substring(0, path.lastIndexOf('.'));
}

export function getDocPathFromUrl(url) {
  let path = getPathFromUrl(url);
  if (!path) {
    return undefined;
  }
  if (path.endsWith('/')) {
    path += 'index';
  } else if (path.endsWith('.html')) {
    path = path.slice(0, -5);
  }
  return `${path}.docx`;
}

export function getUrlInfo() {
  if (urlInfo) {
    return urlInfo;
  }
  const location = new URL(document.location.href);
  function getParam(name) {
    return location.searchParams.get(name);
  }
  const sub = location.hostname.split('.').shift().split('--');

  const sp = getParam('referrer');
  const owner = getParam('owner') || sub[2];
  const repo = getParam('repo') || sub[1];
  const ref = getParam('ref') || sub[0];

  urlInfo = {
    sp,
    owner,
    repo,
    ref,
    origin: `https://${ref}--${repo}--${owner}.hlx.page`,
    isValid() {
      return sp && owner && repo && ref;
    },
  };
  return urlInfo;
}

export async function simulatePreview(path, retryAttempt = 1) {
  const previewStatus = { success: true, path };
  try {
    getUrlInfo();
    const previewUrl = `https://admin.hlx.page/preview/${urlInfo.owner}/${urlInfo.repo}/${urlInfo.ref}${path}`;
    const response = await fetch(
      `${previewUrl}`,
      { method: 'POST' },
    );
    if (!response.ok && retryAttempt <= MAX_RETRIES) {
      await simulatePreview(path, retryAttempt + 1);
    }
    previewStatus.responseJson = await response.json();
  } catch (error) {
    previewStatus.success = false;
  }
  return previewStatus;
}
