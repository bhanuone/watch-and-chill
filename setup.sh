# install node
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
source ~/.bashrc
sudo apt install -y curl vim git
nvm install 12 --lts
# install yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y --no-install-recommends yarn
git clone https://github.com/bhanuone/watch-and-chill.git
cd watch-and-chill
yarn install