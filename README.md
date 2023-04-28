# GitHub Action for Transient Tags

Retrieves the latest version tag from a repository and splits it into parts for use as transient tags. Transient tags are not fixed and should version roll between commits. Typical use cases are for tagging major `v1` and minor `v1.2` versions on Github Actions and Docker Images.

This action does not tag your repository.

## Action Inputs

| Input Name     | Description                                                                                              | Default Value  |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------------- |
| `token`        | A token for performing authenticated requests to the GitHub API.                                         | `GITHUB_TOKEN` |
| `force-semver` | Specify whether explicit semantic versioning is required. Any `v` prefix will automatically be stripped. | `false`        |

## Action Outputs

| Output Name | Description                                              | Type   | Example  |
| ----------- | -------------------------------------------------------- | ------ | -------- |
| `major`     | The latest major version from the current repository.    | String | `v1`     |
| `minor`     | The latest minor version from the current repository.    | String | `v1.2`   |
