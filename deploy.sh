#!/usr/bin/env bash
set -euo pipefail

# Script de preparacion y despliegue para AWS EC2 (Ubuntu 22.04/24.04)
# Uso:  sudo bash deploy.sh

echo "==> Instalando Docker..."
if ! command -v docker &>/dev/null; then
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> Iniciando servicio Docker..."
systemctl enable --now docker
systemctl start docker

echo "==> Construyendo y levantando contenedores..."
cd "$(dirname "$0")/backend" || exit 1
docker compose up --build -d

echo "==> ¡Despliegue completado!"
docker compose ps
echo
echo "Accede al frontend:  http://$(curl -s http://checkip.amazonaws.com)/"