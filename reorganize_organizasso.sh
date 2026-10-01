#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$PWD}"
cd "$ROOT"

echo "[1/7] Création des dossiers"
mkdir -p client/src/components server/routes server/db

# Déplacement frontend
frontend_components=(
  AdminBadge.jsx
  App.jsx
  Comment.jsx
  CommentList.jsx
  Forum.jsx
  ForumPublic.jsx
  Home.jsx
  LikeButton.jsx
  Login.jsx
  Logout.jsx
  Message.jsx
  MessageForm.jsx
  MessageList.jsx
  MessagesPrives.jsx
  NavigationPanel.jsx
  Profile.jsx
  Recherche.jsx
  ReportButton.jsx
  Signup.jsx
  SignupInProgress.jsx
  User.jsx
  UserBanner.jsx
  ValidationInscription.jsx
)

frontend_root=(
  api.js
  index.css
  main.jsx
  index.html
  vite.config.js
)

server_root=(
  server.js
)

server_routes=(
  auth.js
  messages.js
  users.js
)

server_db=(
  connection.js
  populate.js
)

echo "[2/7] Déplacement des fichiers React"
for f in "${frontend_components[@]}"; do
  [ -f "$f" ] && mv -n "$f" client/src/components/
done
for f in "${frontend_root[@]}"; do
  [ -f "$f" ] && mv -n "$f" client/
done

echo "[3/7] Déplacement des fichiers serveur"
for f in "${server_root[@]}"; do
  [ -f "$f" ] && mv -n "$f" server/
done
for f in "${server_routes[@]}"; do
  [ -f "$f" ] && mv -n "$f" server/routes/
done
for f in "${server_db[@]}"; do
  [ -f "$f" ] && mv -n "$f" server/db/
done

echo "[4/7] Déplacement éventuel des dépendances frontend"
[ -d node_modules ] && mv -n node_modules client/ || true
[ -f package.json ] && mv -n package.json client/ || true
[ -f package-lock.json ] && mv -n package-lock.json client/ || true

echo "[5/7] Création du package.json serveur si absent"
if [ ! -f server/package.json ]; then
  cat > server/package.json <<'JSON'
{
  "name": "organiz-asso-server",
  "version": "1.0.0",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "express-session": "^1.18.0",
    "mongodb": "^6.8.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
JSON
fi

echo "[6/7] Ajustement du point d'entrée HTML"
if [ -f client/index.html ]; then
  sed -i 's|/main.jsx|/src/main.jsx|g' client/index.html
  sed -i 's|/src/main.jsx|/src/main.jsx|g' client/index.html
fi

echo "[7/7] Structure finale"
echo "--- client ---"
find client -maxdepth 3 -type f | sort

echo "--- server ---"
find server -maxdepth 3 -type f | sort

echo
echo "Ensuite lance :"
echo "  cd client && npm install && npm run dev"
echo "  cd ../server && npm install && npm run dev"
