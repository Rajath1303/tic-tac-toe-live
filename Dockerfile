ENTRYPOINT /bin/sh -ecx "\
/nakama/nakama migrate up --database.address $DATABASE_URL && \
exec /nakama/nakama \
  --name nakama1 \
  --config /nakama/data/local.yml \
  --database.address $DATABASE_URL \
  --logger.level DEBUG \
  --session.token_expiry_sec 7200
"