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
import * as client from '@actions/http-client'
import * as cache from '@actions/tool-cache'
import * as os from 'os'
import * as path from 'path'

const osPlatform = os.platform() as string
const osArch = os.arch()

export interface GithubTag {
  tag_name: string
}

export async function downloadTT(version: string): Promise<string> {
  core.info(`identified platform ${osPlatform}`)

  core.info(`Searching Github for tt version: ${version}`)
  const result = await queryVersion(version)
  if (!result) {
    throw new Error(`Cannot download tt version '${version}' from Github`)
  }
  core.info(`Found tt version: ${result.tag_name}`)

  // Having verified the version. Download it.
  const filename = getFilename(result.tag_name)

  core.info(`Attempt to retrieve package: ${filename}`)

  core.info(`Downloading tt version: ${result.tag_name}`)
  const toolPath = await cache.downloadTool(
    `https://github.com/purpleclay/tt/releases/download/${result.tag_name}/${filename}`
  )

  // Unpack and cache the binary
  core.debug('Extracting tt binary from package')
  const extractPath = await cache.extractTar(toolPath)
  core.debug(`Extracted to: ${extractPath}`)

  const cachePath = await cache.cacheDir(
    extractPath,
    'tt',
    result.tag_name.replace('/^v/', '')
  )
  core.debug(`Binary cached at: ${cachePath}`)

  return path.join(cachePath, 'tt')
}

const queryVersion = async (version: string): Promise<GithubTag | null> => {
  let url = ''

  if (version === 'latest') {
    url = 'https://api.github.com/repos/purpleclay/tt/releases/latest'
  } else {
    url = `https://api.github.com/repos/purpleclay/tt/releases/tags/${version}`
  }
  core.debug(`Identified Github URL for download: ${url}`)

  const http = new client.HttpClient('transient-tags-action')

  return (await http.getJson<GithubTag>(url)).result
}

const getFilename = (version: string): string => {
  // Map the arch to supported values within the github release artifacts
  let arch = ''
  let extension = 'tar.gz'
  switch (osArch) {
    case 'x64':
      arch = 'x86_64'
      break
    default:
      arch = osArch
  }

  if (osPlatform == 'windows') {
    extension = 'zip'
  }

  return `tt_${version.replace(/^v/, '')}_${osPlatform}_${arch}.${extension}`
}
