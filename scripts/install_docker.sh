#!/bin/bash

# Update package lists
sudo apt-get update

# Install necessary dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Download and execute the official get-docker.sh script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add the current user to the 'docker' group to run Docker commands without sudo
sudo usermod -aG docker "$USER"

echo "Docker installation complete. Please log out and log back in for group changes to take effect."
echo "You can verify the installation by running: docker run hello-world"