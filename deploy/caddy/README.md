# TLS + reverse proxy on the VPS

The VPS reverse proxy is **Caddy**, not nginx — Caddy binds `:80` and `:443`,
so nginx cannot start alongside it. All three estates services are proxied by
`bookyourvisit.caddy`.

Certs come from **certbot via DNS-01**. Two reasons the usual paths don't work
here:

- `certbot --nginx` / `--standalone` need to own port 80. Caddy has it.
- The domain is behind the Cloudflare proxy (orange cloud), which terminates
  TLS at the edge. That breaks TLS-ALPN-01 and is why Caddy's own automatic
  issuance fails — the symptom is a Cloudflare **525 SSL handshake failed**.

DNS-01 avoids both and yields a wildcard, so one cert covers all three
hostnames and anything added later.

## One-time setup

### 1. Cloudflare API token

Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit zone
DNS** template → Zone Resources: `samarthh.me`. Copy the token.

```bash
sudo apt install -y certbot python3-certbot-dns-cloudflare

sudo mkdir -p /etc/letsencrypt
sudo tee /etc/letsencrypt/cloudflare.ini >/dev/null <<'EOF'
dns_cloudflare_api_token = PASTE_TOKEN_HERE
EOF
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
```

The token is zone-scoped to DNS edits only — it cannot touch the proxy,
firewall, or other zones.

### 2. Issue the wildcard

```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 30 \
  -d samarthh.me -d '*.samarthh.me'
```

Quote `'*.samarthh.me'` — an unquoted `*` is glob-expanded by the shell.

### 3. Let Caddy read the certs

Caddy drops privileges to the `caddy` user, but `/etc/letsencrypt/{live,archive}`
are root-only `0700`. Without this it fails to load the cert at startup.

```bash
sudo apt install -y acl
sudo setfacl -R  -m u:caddy:rX /etc/letsencrypt/live /etc/letsencrypt/archive
sudo setfacl -dR -m u:caddy:rX /etc/letsencrypt/live /etc/letsencrypt/archive
```

The second line sets the *default* ACL, so renewals inherit it.

### 4. Reload Caddy on renewal

Certbot's timer renews silently; Caddy keeps serving the old cert until told
otherwise.

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-caddy.sh >/dev/null <<'EOF'
#!/bin/sh
systemctl reload caddy
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-caddy.sh
```

### 5. Install the site config

```bash
grep -n import /etc/caddy/Caddyfile   # check for an existing sites import
sudo mkdir -p /etc/caddy/sites
sudo cp deploy/caddy/bookyourvisit.caddy /etc/caddy/sites/
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

If `/etc/caddy/Caddyfile` has no `import sites/*`, add that line, or append
this file's contents to it directly.

### 6. Cloudflare SSL mode

SSL/TLS → Overview → **Full (strict)**. Not Flexible — Flexible sends plaintext
to port 80 and loops against Caddy's HTTPS redirect.

## Verify

Bypassing Cloudflare, from the VPS:

```bash
curl -sk https://127.0.0.1/health -H "Host: bookyourvisit-api.samarthh.me"
curl -sk https://127.0.0.1 -H "Host: bookyourvisit.samarthh.me" -o /dev/null -w '%{http_code}\n'
```

Renewal dry run:

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
```

## Disable nginx

It can never bind while Caddy runs; leaving it enabled just produces failed
units on every boot.

```bash
sudo rm -f /etc/nginx/sites-enabled/bookyourvisit.conf
sudo systemctl disable --now nginx
```
