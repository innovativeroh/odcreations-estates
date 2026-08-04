# TLS + reverse proxy on the VPS

Host: `storentia-prod` (`45.195.159.70`). Deploy dir:
`/var/www/bookurvisit/odcreations-estates`.

## Do not disable nginx

**Caddy is the edge** — it owns `:80` and `:443` and terminates TLS for
everything. **nginx is not idle**: it listens on `127.0.0.1:8081` and Caddy
reverse-proxies `techsolace.in`, `cdn.techsolace.in`, `apis.storentia.com`, and
`dashboard.storentia.com` to it.

Stopping or disabling nginx takes all of those offline while Caddy keeps
answering — you get a live edge proxying to nothing. If nginx fails to start
with an "address already in use" error, the cause is a vhost that declares
`listen 80` or `listen 443`; fix that vhost, never disable the service.

The estates services are proxied by Caddy directly to their published container
ports and do not involve nginx at all.

## Layout

`/etc/caddy/Caddyfile` is a single monolithic file — there is no `sites/`
directory and no `import`. The estates config lives at the end of it, and
`bookyourvisit.caddy` in this repo is the reference copy of that section.

| Hostname | Origin | Container |
|---|---|---|
| `bookyourvisit-api.samarthh.me` | `127.0.0.1:7410` | `estates-backend` |
| `bookyourvisit.samarthh.me` | `127.0.0.1:7411` | `estates-webfront` |
| `bookyourvisit-admin.samarthh.me` | `127.0.0.1:7412` | `estates-admin` |

## TLS

These hostnames are behind the Cloudflare proxy (orange cloud). Cloudflare
terminates browser TLS, then opens its own connection to this origin. That
breaks ACME TLS-ALPN-01, so Caddy cannot auto-issue for them — the symptom is a
Cloudflare **525 SSL handshake failed**.

Current setup: `tls internal` (Caddy's self-signed cert) with Cloudflare SSL
mode **`Full`**. Cloudflare is the only client on that hop and `Full` does not
verify the origin cert, so the traffic is encrypted end to end without any cert
plumbing.

Mode matters:

| CF mode | Result |
|---|---|
| Flexible | Plaintext to origin, redirect loop. Broken. |
| **Full** | **What we use. Works.** |
| Full (strict) | Rejects the self-signed cert → 526. |

### Upgrading to Full (strict)

Optional hardening, not required. Either:

- **Cloudflare Origin Certificate** — dashboard → SSL/TLS → Origin Server →
  Create Certificate for `samarthh.me, *.samarthh.me`. Write the two blocks to
  `/etc/ssl/cloudflare/`, `chown caddy:caddy`, `chmod 640` the key, then swap
  the `estates_tls` snippet to point at them. 15-year validity, no renewal.
- **certbot DNS-01** — `python3-certbot-dns-cloudflare` with a token scoped to
  the `samarthh.me` zone (needs Zone:Read *and* DNS:Edit; a token missing
  Zone:Read fails with `6003 Invalid request headers`). Requires a `setfacl`
  grant so the `caddy` user can read `/etc/letsencrypt/{live,archive}`, plus a
  deploy hook to `systemctl reload caddy`.

HTTP-01 and `--nginx` do not work here: Caddy holds port 80, and nginx is on
8081 where ACME cannot reach it.

## Deploy

```bash
ssh storentia-prod
cd /var/www/bookurvisit/odcreations-estates
git pull
docker compose up -d --build
docker compose ps
```

Webfront and admin wait on the backend healthcheck — allow ~45s.

After editing `/etc/caddy/Caddyfile`:

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%F-%H%M)
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

## Verify

Origin, bypassing Cloudflare. Use `--resolve`, not `-H "Host:"` — the latter
does not set SNI, so Caddy falls through to the on-demand catch-all and the
handshake fails with a misleading `000`:

```bash
curl -sk --resolve bookyourvisit-api.samarthh.me:443:127.0.0.1 \
  https://bookyourvisit-api.samarthh.me/health
```

Public:

```bash
for u in https://bookyourvisit-api.samarthh.me/health \
         https://bookyourvisit.samarthh.me \
         https://bookyourvisit-admin.samarthh.me \
         https://techsolace.in \
         https://dashboard.storentia.com; do
  printf "%-48s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' "$u")"
done
```

Expected: `200`, `200`, `307` (login redirect), `200`, `200`.
