mkdir dev
cd dev
git clone git@bitbucket.org:alexaltech/pwc_frontend.git
cd pwc_frontend
git checkout develop
git pull origin develop
docker-compose up -d