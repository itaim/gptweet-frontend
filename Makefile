include .env

HEROKU_APP = gptweet-frontend

.PHONY: all

heroku-push:
	docker buildx build --platform linux/amd64 -t ${HEROKU_APP} .
	docker tag ${HEROKU_APP} registry.heroku.com/${HEROKU_APP}/web
	docker push registry.heroku.com/${HEROKU_APP}/web
	heroku container:release web -a ${HEROKU_APP}

heroku-config:
	heroku config:set -a ${HEROKU_APP} $(shell cat .env | sed -e 's/[\r\n]//g' -e 's/^/ /')
	heroku config:set -a ${HEROKU_APP} NEXT_PUBLIC_CLIENT_DOMAIN=https://www.rolebotics.com NEXT_PUBLIC_SERVER_DOMAIN=https://gptweet.rolebotics.com

heroku-login:
	heroku container:login
