# ローカル開発をhttpsのドメインで行う設定手順
#
# サムネイルのアップロード処理、カメラのオープン処理はlocalhostだと都合が悪い箇所がある
# 一方でlocalhost以外の場合、webpackerでエラーログが頻発する
# そこで、ちゃんとしたドメインのhttpsサーバを立て、ローカルdocker内開発を行うための設定手順をまとめる
#
# 1) docker-compose.ymlで443ポートを強制オープンする
#    ports:
#      - "443:443"
# 2) HTTPSに使用するドメインを決める 例: gc2.mydomain.com
# 3) dockerホストコンピュータの自宅wifiのアドレスをDNSサーバで設定 例: gc2.mydomain.com A 192.168.1.2
# 4) Let's encryptでSSL証明書を発行する
# 例: sudo certbot certonly --manual --preferred-challenges dns -m gc2dev@mydomain.com --agree-tos -d gc2.mydomain.com -d *.gc2.mydomain.com
# (省略) _acme-challenge
# 5) 作成したSSL証明書をtmpフォルダに配置
# /workspaces/mastodon/tmp/fullchain.pem
# /workspaces/mastodon/tmp/privkey.pem
# 6) .envに3つの環境変数を定義する
# LOCAL_DOMAIN=gc2.mydomain.com
# LOCAL_HTTPS=true
# STREAMING_API_BASE_URL=wss://gc2.mydomain.com
# 7) このスクリプトを実行してnginxのconfを書き換えしてnginxを実行
# .devcontainer/devHttpsDomain.sh
# 8) config/webpacker.yml 60行目を書き換える 上記スクリプト内で済み
#    public: gc2.mydomain.com
# 9) foreman startし、 https://gc2.mydomain.com/ で動作確認する
# 10) 自宅wifi内の別のコンピュータ(スマホ等)からも同ドメインでアクセスできることを確認する

source .env

sudo apt install -y nginx
cp dist/nginx.conf tmp/nginx.conf
sed 's#/etc/letsencrypt/live/example.com/#/workspaces/mastodon/tmp/#' tmp/nginx.conf > tmp/nginx2.conf
sed 's/# ssl_certificate/ssl_certificate/' tmp/nginx2.conf > tmp/nginx.conf
sed "s/example.com/$LOCAL_DOMAIN/" tmp/nginx.conf > tmp/nginx2.conf
cp tmp/nginx2.conf tmp/mastodon.conf
cat << 'EOS' | sed "/error_page/ e cat /dev/stdin" tmp/nginx2.conf > tmp/mastodon.conf
  location /sockjs-node {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Proxy "";

    proxy_pass http://127.0.0.1:3035;
    proxy_buffering off;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    tcp_nodelay on;
  }

EOS

sudo cp tmp/mastodon.conf /etc/nginx/sites-available/mastodon
sudo ln -s /etc/nginx/sites-available/mastodon /etc/nginx/sites-enabled/mastodon
sudo nginx -s stop
sudo nginx

cp config/webpacker.yml tmp/webpacker.yml
sed "s/public: localhost:3035/public: $LOCAL_DOMAIN/" config/webpacker.yml > tmp/webpacker.yml
cp tmp/webpacker.yml config/webpacker.yml
git update-index --skip-worktree config/webpacker.yml
# ↑ 間違ってコミットしないように変更を無視する
# git update-index --no-skip-worktree config/webpacker.yml

echo "devHttpsDomains.sh finished"
