#!/bin/sh
export NODE_ENV=production
forever start ./forever/production.json
