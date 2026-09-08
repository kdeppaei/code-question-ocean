# CodeDive self-hosted Judge0

This bundle installs Judge0 CE **v1.13.1** on a fresh Ubuntu 22.04 LTS host. It enables token authentication, disables submission networking and optional callbacks/files/compiler flags, and lowers the maximum resource limits used by this site.

## Requirements

- A dedicated Ubuntu 22.04 LTS server with at least 4 GB RAM
- Docker Engine with the Compose plugin
- A public HTTPS hostname such as `judge.example.com`
- Firewall rules that expose only HTTPS; keep PostgreSQL and Redis private

## Install

```bash
sudo bash setup.sh
```

The installer refuses to overwrite `/opt/judge0`. Put an HTTPS reverse proxy in front of the service, then add the printed URL/header/token to the Site environment as `JUDGE0_API_URL`, `JUDGE0_AUTH_HEADER`, and secret `JUDGE0_AUTH_TOKEN`. Optionally set `JUDGE0_FALLBACK_API_URL=https://ce.judge0.com` while bringing the private service online.

## Verify

```bash
curl --fail --header "X-Auth-Token: YOUR_TOKEN" https://judge.example.com/system_info
```

Rotate the authentication token after any suspected exposure and keep Docker, Ubuntu, and Judge0 patched. The application also requires ChatGPT sign-in and applies a 20-runs-per-minute limit per account before requests reach Judge0.
