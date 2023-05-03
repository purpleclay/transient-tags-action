# Transient Tags Action

Retrieves the latest version and splits it into `major` and `minor` transient tags before tagging the repository. Typical use cases are for managing rolling versions on GitHub Actions and Docker Images.

For example, if the latest version were `v1.2.3`, this action would tag the latest commit with a `v1` (_major_) and `v1.2` (_minor_) tag.

## Getting Started

```yaml
name: release
on:
  push:
    tags:
      - 'v*.*.*'
jobs:
  release:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Transient Tags
        uses: purpleclay/transient-tags-action@v1
```

> `contents:write` permissions are required on the `GITHUB_TOKEN` provided to the action

## Action Inputs

| Input Name     | Description                                                                                              | Default Value  |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------------- |
| `token`        | A token for performing authenticated requests to the GitHub API.                                         | `GITHUB_TOKEN` |
| `force-semver` | Specify whether explicit semantic versioning is required. Any `v` prefix will automatically be stripped. | `false`        |

## Action Outputs

| Output Name | Description                                           | Type   | Example |
| ----------- | ----------------------------------------------------- | ------ | ------- |
| `major`     | The latest major version from the current repository. | String | `v1`    |
| `minor`     | The latest minor version from the current repository. | String | `v1.2`  |
