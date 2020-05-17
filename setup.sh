# install nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

#install tmux
sudo apt install -y tmux

SESSION_NAME="initial_setup"
tmux new-session -d -s $SESSION_NAME -n 'install_node'

tmux select-window -t $SESSION_NAME:1
tmux send-keys "nvm install 12 --lts" C-m


tmux new-session -d -s $SESSION_NAME -n 'install_yarn'
tmux select-window -t $SESSION_NAME:2
tmux send-keys "sudo apt install -y vim" 
# install yarn
tmux send-keys "curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -" C-m
tmux send-keys "echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list" C-m
tmux send-keys "sudo apt update && sudo apt install -y --no-install-recommends yarn" C-m
tmux send-keys "git clone https://github.com/bhanuone/watch-and-chill.git" C-m
tmux send-keys "cd watch-and-chill && yarn install"

tmux -2 attach-session -t $SESSION_NAME