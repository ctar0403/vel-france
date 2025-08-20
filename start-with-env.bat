@echo off
echo Setting environment variables...
set DATABASE_URL=postgresql://neondb_owner:npg_LDQdZpRo02wT@ep-small-glitter-adj30x5f.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
set SESSION_SECRET=EjHzjqyhqptJ+LmqpDKjJ9cuGXJ4kdQmfm0sNTAaYAOXWGeGPKyVlRyoS3ITRwLzhnWf0PEHRAtyb0Z/C97vQA==
set NODE_ENV=production
set PORT=5000
set EMAIL_USER=g.bokuchava22@gmail.com
set EMAIL_APP_PASSWORD=dofj ejxj fjws fqmq
set BOG_CLIENT_ID=10001216
set BOG_CLIENT_SECRET=vNx6Sx1bge5g

echo Starting production server...
node dist/production.js
