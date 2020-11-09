#!/usr/bin/env bash
if [ ! -f ".env" ]; then
  echo "ERROR: You need to create a .env file!"
  cp .env.sample .env
  echo "A base .env file has been created for you. Fill out anything in brackets and rerun this command."
  exit 1
fi

deploy_target=$1

if [[ $deploy_target == "dev" ]]; then
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
elif [[ $deploy_target  == "prod" ]]; then
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
else
  echo "Invalid deployment target specified! Must run as either:"
  echo "  ./run.sh dev"
  echo "  ./run.sh prod"
fi
