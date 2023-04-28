// Copyright (c) 2023 Purple Clay
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// in the Software without restriction, including without limitation the rights
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as cache from '@actions/tool-cache'
import * as os from 'os'
import * as path from 'path'

const osPlatform = os.platform() as string
const osArch = os.arch()

export interface GithubTag {
  tag_name: string
}

export async function downloadTT(version: string): Promise<string> {
  const filename = getFilename(version)
  core.info(`Attempt to retrieve package: ${filename}`)

  core.info(`Downloading tt version: ${version}`)
  const toolPath = await cache.downloadTool(
    `https://github.com/purpleclay/tt/releases/download/${version}/${filename}`
  )

  // Unpack and cache the binary
  core.debug('Extracting tt binary from package')
  const extractPath = await cache.extractTar(toolPath)
  core.debug(`Extracted to: ${extractPath}`)

  const cachePath = await cache.cacheDir(
    extractPath,
    'tt',
    version.replace('/^v/', '')
  )
  core.debug(`Binary cached at: ${cachePath}`)

  return path.join(cachePath, 'tt')
}

export const queryLatestVersion = async (
  token: string
): Promise<GithubTag | null> => {
  const octokit = github.getOctokit(token)

  core.info('Searching Github for latest tt version')
  const {data: release} = await octokit.rest.repos.getLatestRelease({
    owner: 'purpleclay',
    repo: 'tt'
  })

  core.info(`Found latest tt version: ${release.tag_name}`)
  return release
}

const getFilename = (version: string): string => {
  // Map the arch to supported values within the github release artifacts
  let arch = ''
  let extension = 'tar.gz'
  let platform = osPlatform

  switch (osArch) {
    case 'x64':
      arch = 'x86_64'
      break
    default:
      arch = osArch
  }

  if (platform === 'win32') {
    platform = 'windows'
    extension = 'zip'
  }

  return `tt_${version.replace(/^v/, '')}_${platform}_${arch}.${extension}`
}
