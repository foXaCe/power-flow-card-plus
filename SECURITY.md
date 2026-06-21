# Security Policy

## Supported versions

Only the latest release on the `main` branch is supported. Please make sure you are
running the most recent version of the card before reporting a security issue.

| Version               | Supported |
| --------------------- | --------- |
| Latest `main` release | ✅        |
| Older releases        | ❌        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
Discussions, or pull requests.**

Instead, report them privately through GitHub's
[private vulnerability reporting](https://github.com/foXaCe/power-flow-card-plus/security/advisories/new).

Please include as much of the following as you can:

- A description of the vulnerability and its impact
- Steps to reproduce, or a proof of concept
- The version of the card and of Home Assistant affected
- Any suggested remediation

You can expect an initial response within **7 days**. Once the issue is confirmed,
a fix will be released as soon as practical and you will be credited, unless you
prefer to remain anonymous.

## Scope

This is a Home Assistant Lovelace (frontend) custom card that runs in the browser
within your Home Assistant dashboard. Dependency vulnerabilities are monitored
automatically via [Renovate](https://docs.renovatebot.com/) (`vulnerabilityAlerts`)
and surfaced as `security`-labelled pull requests.
