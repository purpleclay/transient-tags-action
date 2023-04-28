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
import * as exec from '@actions/exec'
import * as installer from './github'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    const forceSemVer = core.getBooleanInput('force-semver') || false

    const latest = await installer.queryLatestVersion(token)
    if (!latest) {
      throw new Error('Cannot find latest tt version on Github')
    }

    // Download and grab path to the binary
    const path = await installer.downloadTT(latest.tag_name)
    core.info(`Executing tt at path ${path}`)
    const out = await runTT(path, forceSemVer)

    core.setOutput('major', out.Major)
    core.setOutput('minor', out.Minor)
  } catch (error) {
    const err = error as Error
    core.setFailed(err.message)
  }
}

type Out = {
  Major: string
  Minor: string
}

async function runTT(path: string, forceSemVer: boolean): Promise<Out> {
  const env = { TT_SEMVER: forceSemVer ? '1' : '0', ...process.env }

  // Ensure the output is captured
  let output = ''

  core.info('Running tt')
  await exec.exec(`${path}`, [], {
    env,
    listeners: {
      stdout(buffer) {
        output += buffer
      }
    }
  })

  const parts = output.split(',', 3)
  return { Major: parts[1], Minor: parts[2] }
}

run()
