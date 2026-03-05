#!/bin/bash
cd /vercel/share/v0-project
npx prisma db push --skip-generate
npx prisma generate
npx tsx prisma/seed.ts
