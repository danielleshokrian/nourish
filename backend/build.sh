#!/usr/bin/env bash
# exit on error

set -o errexit
 
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
python -c "from run import app, db; app.app_context().push(); db.create_all(); print('Database initialized!')"