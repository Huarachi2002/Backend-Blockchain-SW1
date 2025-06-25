#!/bin/bash
# deploy-docker-ec2.sh

set -e

echo "🚀 Iniciando despliegue Docker en EC2"
echo "====================================="

# Verificar requisitos
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando..."
    sudo amazon-linux-extras install docker
    sudo service docker start
    sudo usermod -a -G docker $USER
    sudo systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.16.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configurar .env para Docker
echo "📝 Configurando variables de entorno..."
cat > .env << EOL
PORT=3002
LOCAL_RPC_URL=http://hardhat-node:8545
EOL

# Construir y levantar contenedores
echo "🔨 Construyendo contenedores Docker..."
docker-compose build

echo "🚢 Iniciando servicios..."
docker-compose up -d

# Esperar a que el nodo de Hardhat esté listo
echo "⏳ Esperando a que el nodo Hardhat esté listo..."
sleep 20

# Desplegar contratos
echo "📄 Desplegando contratos..."
docker-compose exec blockchain-api npx hardhat run scripts/deploy-docker.js --network localhost

# Verificar estado
echo "🔍 Verificando servicios..."
docker-compose ps

echo "✅ Despliegue completo! La API está disponible en http://localhost:3002"
echo "📊 Para ver logs: docker-compose logs -f"