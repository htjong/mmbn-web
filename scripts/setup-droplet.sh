#!/usr/bin/env bash
# ============================================================
# MMBN Web — DigitalOcean Droplet Setup Script
# Run once on a fresh Ubuntu 22.04 Droplet ($6/mo)
#
# Prerequisites:
#   - SSH access as root
#   - GitHub repo accessible (public or deploy key configured)
#
# Usage:
#   ssh root@DROPLET_IP 'bash -s' < scripts/setup-droplet.sh
# ============================================================

set -euo pipefail

APP_DIR="/app"
DEPLOY_USER="deploy"
NODE_VERSION="22"

echo "==> Creating deploy user"
if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  mkdir -p /home/$DEPLOY_USER/.ssh
  cp ~/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/
  chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
  chmod 700 /home/$DEPLOY_USER/.ssh
  chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
fi

echo "==> Installing Node.js $NODE_VERSION"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "==> Installing PM2"
npm install -g pm2

echo "==> Installing nginx"
apt-get install -y nginx

echo "==> Setting up swap (1GB)"
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Creating app directory"
mkdir -p "$APP_DIR"
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# Note: GitHub Actions builds the app and rsyncs artifacts to /app.
# No git clone or npm build needed on the Droplet.

echo "==> Configuring nginx"
cp scripts/nginx.conf /etc/nginx/sites-available/mmbn
ln -sf /etc/nginx/sites-available/mmbn /etc/nginx/sites-enabled/mmbn
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Starting server with PM2"
sudo -u $DEPLOY_USER pm2 start packages/server/dist/server/src/index.js --name mmbn-server
sudo -u $DEPLOY_USER pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
sudo -u $DEPLOY_USER pm2 save

echo "==> Configuring firewall"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Setup complete!"
echo "    Visit http://$(curl -s ifconfig.me) to verify"
echo "    Health check: curl http://$(curl -s ifconfig.me)/health"
