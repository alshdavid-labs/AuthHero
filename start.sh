#!/bin/bash
# -------------------------------------------------
# This script file is used as a start up script for
# each software deployed on this droplet at boot up
# -------------------------------------------------
#
# Rules
#
# 1) create a start up bash script in the directory of your software
# 2) run that bash file from here
# 3) enjoy
#

echo "Starting authHero -- api.authhero.com"
# screen -A -d -m -S authHero node authHero-API/app.js http://128.199.247.60:501/
sh authHero-API/start.sh 
