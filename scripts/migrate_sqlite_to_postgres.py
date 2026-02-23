#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

try:
  import psycopg
  from psycopg import sql
except ImportError as exc:  # pragma: no cover
  raise SystemExit("psycopg ist nicht installiert. Bitte: pip install -r requirements.txt") from exc


@dataclass(frozen=True)
class TableSpec:
  name: str
  columns: tuple[str, ...]


TABLES: tuple[TableSpec, ...] = (
  TableSpec(
    name="clinics",
    columns=(
      "id",
      "name",
      "logo_url",
      "website",
      "brand_color",
      "accent_color",
      "font_family",
      "design_preset",
      "calendly_url",
      "subscription_status",
      "stripe_customer_id",
      "stripe_subscription_id",
      "created_at",
    ),
  ),
  TableSpec(
    name="users",
    columns=(
      "id",
      "clinic_id",
      "role",
      "email",
      "password_hash",
      "full_name",
      "clinic_name",
      "logo_url",
      "website",
      "brand_color",
      "accent_color",
      "font_family",
      "design_preset",
      "calendly_url",
      "subscription_status",
      "stripe_customer_id",
      "stripe_subscription_id",
      "created_at",
    ),
  ),
  TableSpec(
    name="payments",
    columns=(
      "id",
      "user_id",
      "stripe_session_id",
      "stripe_payment_intent_id",
      "stripe_subscription_id",
      "stripe_customer_id",
      "item_name",
      "item_type",
      "amount_cents",
      "currency",
      "status",
      "created_at",
    ),
  ),
  TableSpec(
    name="subscriptions",
    columns=(
      "id",
      "user_id",
      "stripe_session_id",
      "stripe_customer_id",
      "stripe_subscription_id",
      "plan_name",
      "amount_cents",
      "currency",
      "status",
      "current_period_end",
      "created_at",
      "updated_at",
    ),
  ),
  TableSpec(
    name="api_tokens",
    columns=(
      "id",
      "user_id",
      "token_hash",
      "created_at",
      "last_used_at",
      "revoked_at",
      "expires_at",
    ),
  ),
  TableSpec(
    name="leads",
    columns=(
      "id",
      "full_name",
      "email",
      "phone",
      "company_name",
      "website",
      "has_devices",
      "recurring_revenue_band",
      "consent_sms",
      "consent_marketing",
      "brand_color",
      "font_family",
      "created_at",
    ),
  ),
  TableSpec(
    name="analytics_events",
    columns=(
      "id",
      "clinic_id",
      "user_id",
      "event_name",
      "treatment_id",
      "amount_cents",
      "metadata_json",
      "event_source",
      "created_at",
    ),
  ),
  TableSpec(
    name="clinic_catalogs",
    columns=(
      "id",
      "clinic_id",
      "categories_json",
      "treatments_json",
      "memberships_json",
      "reward_actions_json",
      "reward_redeems_json",
      "home_articles_json",
      "created_at",
      "updated_at",
    ),
  ),
  TableSpec(
    name="patient_memberships",
    columns=(
      "id",
      "clinic_id",
      "patient_email",
      "patient_name",
      "membership_id",
      "membership_name",
      "monthly_amount_cents",
      "currency",
      "status",
      "started_at",
      "current_period_end",
      "next_charge_at",
      "canceled_at",
      "last_payment_status",
      "created_at",
      "updated_at",
    ),
  ),
  TableSpec(
    name="clinic_campaigns",
    columns=(
      "id",
      "clinic_id",
      "name",
      "trigger_type",
      "channel",
      "status",
      "template_title",
      "template_body",
      "points_bonus",
      "last_run_at",
      "next_run_at",
      "total_runs",
      "total_audience",
      "created_by_user_id",
      "created_at",
      "updated_at",
    ),
  ),
  TableSpec(
    name="audit_logs",
    columns=(
      "id",
      "clinic_id",
      "actor_user_id",
      "action",
      "entity_type",
      "entity_id",
      "metadata_json",
      "created_at",
    ),
  ),
  TableSpec(
    name="campaign_deliveries",
    columns=(
      "id",
      "clinic_id",
      "campaign_id",
      "recipient_key",
      "channel",
      "status",
      "provider_message_id",
      "error_message",
      "metadata_json",
      "created_at",
    ),
  ),
)


def is_postgres_url(value: str) -> bool:
  normalized = value.lower().strip()
  return normalized.startswith("postgres://") or normalized.startswith("postgresql://")


def normalize_pg_url(value: str) -> str:
  if value.startswith("postgres://"):
    return "postgresql://" + value[len("postgres://"):]
  return value


def sqlite_table_exists(conn: sqlite3.Connection, table_name: str) -> bool:
  row = conn.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1",
    (table_name,),
  ).fetchone()
  return row is not None


def sqlite_table_columns(conn: sqlite3.Connection, table_name: str) -> set[str]:
  rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
  return {row[1] for row in rows}


def fetch_sqlite_rows(conn: sqlite3.Connection, table: TableSpec) -> tuple[list[sqlite3.Row], tuple[str, ...]]:
  if not sqlite_table_exists(conn, table.name):
    return [], ()

  available = sqlite_table_columns(conn, table.name)
  selected_columns = tuple(column for column in table.columns if column in available)
  if not selected_columns:
    return [], ()

  columns = ", ".join(selected_columns)
  rows = conn.execute(f"SELECT {columns} FROM {table.name} ORDER BY id ASC").fetchall()
  return rows, selected_columns


def pg_table_count(cur: psycopg.Cursor, table_name: str) -> int:
  cur.execute(sql.SQL("SELECT COUNT(*) AS count FROM {}") .format(sql.Identifier(table_name)))
  row = cur.fetchone()
  return int(row[0])


def truncate_target_tables(cur: psycopg.Cursor) -> None:
  names = sql.SQL(", ").join(sql.Identifier(t.name) for t in TABLES)
  cur.execute(sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(names))


def copy_table(cur: psycopg.Cursor, table: TableSpec, rows: list[sqlite3.Row], selected_columns: tuple[str, ...]) -> int:
  if not rows:
    return 0

  col_identifiers = [sql.Identifier(c) for c in selected_columns]
  placeholders = [sql.Placeholder() for _ in selected_columns]
  assignments = [
    sql.SQL("{} = EXCLUDED.{}").format(sql.Identifier(c), sql.Identifier(c))
    for c in selected_columns
    if c != "id"
  ]

  if "id" in selected_columns and assignments:
    query = sql.SQL("""
      INSERT INTO {table} ({columns})
      VALUES ({values})
      ON CONFLICT (id) DO UPDATE
      SET {assignments}
    """).format(
      table=sql.Identifier(table.name),
      columns=sql.SQL(", ").join(col_identifiers),
      values=sql.SQL(", ").join(placeholders),
      assignments=sql.SQL(", ").join(assignments),
    )
  else:
    query = sql.SQL("""
      INSERT INTO {table} ({columns})
      VALUES ({values})
    """).format(
      table=sql.Identifier(table.name),
      columns=sql.SQL(", ").join(col_identifiers),
      values=sql.SQL(", ").join(placeholders),
    )

  payload = [tuple(row[c] for c in selected_columns) for row in rows]
  cur.executemany(query, payload)
  return len(payload)


def reset_sequence(cur: psycopg.Cursor, table_name: str) -> None:
  cur.execute(
    sql.SQL(
      """
      SELECT setval(
        pg_get_serial_sequence(%s, 'id'),
        COALESCE((SELECT MAX(id) FROM {}), 1),
        COALESCE((SELECT MAX(id) IS NOT NULL FROM {}), FALSE)
      )
      """
    ).format(sql.Identifier(table_name), sql.Identifier(table_name)),
    (table_name,),
  )


def main() -> int:
  parser = argparse.ArgumentParser(description="Migriert Daten von SQLite nach PostgreSQL.")
  parser.add_argument(
    "--sqlite-path",
    default="clinicflow.db",
    help="Pfad zur SQLite-Datei (Default: clinicflow.db)",
  )
  parser.add_argument(
    "--database-url",
    default="",
    help="PostgreSQL URL. Wenn leer, wird DATABASE_URL aus .env verwendet.",
  )
  parser.add_argument(
    "--truncate",
    action="store_true",
    help="Leert Zieltabellen vor Migration (empfohlen bei Erstmigration).",
  )
  args = parser.parse_args()

  project_root = Path(__file__).resolve().parents[1]
  load_dotenv(project_root / ".env")

  sqlite_path = Path(args.sqlite_path)
  if not sqlite_path.is_absolute():
    sqlite_path = project_root / sqlite_path
  if not sqlite_path.exists():
    raise SystemExit(f"SQLite-Datei nicht gefunden: {sqlite_path}")

  raw_pg_url = (args.database_url or os.getenv("DATABASE_URL", "")).strip()
  if not raw_pg_url:
    raise SystemExit("DATABASE_URL fehlt. Bitte in .env setzen oder --database-url verwenden.")
  if not is_postgres_url(raw_pg_url):
    raise SystemExit("DATABASE_URL ist keine PostgreSQL URL.")
  pg_url = normalize_pg_url(raw_pg_url)

  sqlite_conn = sqlite3.connect(sqlite_path)
  sqlite_conn.row_factory = sqlite3.Row

  copied_total = 0

  try:
    with psycopg.connect(pg_url) as pg_conn:
      with pg_conn.cursor() as cur:
        target_counts = {table.name: pg_table_count(cur, table.name) for table in TABLES}

        has_data = any(count > 0 for count in target_counts.values())
        if has_data and not args.truncate:
          details = ", ".join(f"{name}={count}" for name, count in target_counts.items())
          raise SystemExit(
            "Ziel-DB enthält bereits Daten (" + details + "). "
            "Nutze --truncate für eine saubere Erstmigration."
          )

        if args.truncate:
          truncate_target_tables(cur)

        for table in TABLES:
          rows, selected_columns = fetch_sqlite_rows(sqlite_conn, table)
          copied = copy_table(cur, table, rows, selected_columns)
          copied_total += copied
          print(f"{table.name}: {copied} Datensaetze migriert")

        for table in TABLES:
          reset_sequence(cur, table.name)

      pg_conn.commit()

  finally:
    sqlite_conn.close()

  print(f"Migration abgeschlossen. Insgesamt: {copied_total} Datensaetze")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
