#!/bin/bash
set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ski_school}"
DB_USER="${DB_USER:-ski_school}"
DB_PASSWORD="${DB_PASSWORD}"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"

export PGPASSWORD="$DB_PASSWORD"

echo "Creating backup: $BACKUP_FILE"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE" || {
    echo "Backup failed!"
    exit 1
}

echo "Backup created successfully: $BACKUP_FILE"

find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql" -type f -mtime +7 -delete
echo "Old backups cleaned"

gzip "$BACKUP_FILE"
echo "Backup compressed: ${BACKUP_FILE}.gz"

