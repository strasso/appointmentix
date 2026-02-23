from __future__ import annotations

import os
import re
import secrets
import sqlite3
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import parse_qs, quote_plus, unquote_plus, urlparse

import stripe
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

try:
  import psycopg
  from psycopg.rows import dict_row
except ImportError:
  psycopg = None
  dict_row = None


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "clinicflow.db"
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

APP_SECRET_KEY = os.getenv("APP_SECRET_KEY") or secrets.token_hex(32)
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES = os.getenv(
  "STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES",
  "card,paypal,klarna",
).strip()
CALENDLY_URL = os.getenv("CALENDLY_URL", "https://calendly.com/").strip()
APPOINTMENTIX_PLAN_NAME = os.getenv("APPOINTMENTIX_PLAN_NAME", "Appointmentix White-Label Zugang").strip()
SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "").strip().lower()
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "")
SUPERADMIN_PASSWORD_HASH = os.getenv("SUPERADMIN_PASSWORD_HASH", "").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "").strip()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "").strip()
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID", "").strip()
ONESIGNAL_REST_API_KEY = os.getenv("ONESIGNAL_REST_API_KEY", "").strip()
AUTOMATION_RUNNER_SECRET = os.getenv("AUTOMATION_RUNNER_SECRET", "").strip()
PORT = int(os.getenv("PORT", "4173"))
TRUST_PROXY = os.getenv("TRUST_PROXY", "false").lower() in {"1", "true", "yes"}
try:
  API_TOKEN_TTL_DAYS = max(1, int(os.getenv("API_TOKEN_TTL_DAYS", "45")))
except ValueError:
  API_TOKEN_TTL_DAYS = 45

try:
  APPOINTMENTIX_MONTHLY_AMOUNT_CENTS = max(
    100,
    int(round(float(os.getenv("APPOINTMENTIX_MONTHLY_AMOUNT_EUR", "650")) * 100)),
  )
except ValueError:
  APPOINTMENTIX_MONTHLY_AMOUNT_CENTS = 65000

HEX_COLOR_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")
DATE_ONLY_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DESIGN_PRESETS = {"clean", "bold", "minimal"}
LEAD_DEVICE_OPTIONS = {
  "all_following_and_lasers",
  "micro_needling_hydrafacial",
  "adding_soon",
  "injectables_only",
}
LEAD_REVENUE_OPTIONS = {
  "eur_0_8k",
  "eur_8k_20k",
  "eur_20k_40k",
  "eur_40k_plus",
}
ROLE_CHOICES = {"owner", "staff"}
CALENDLY_PLACEHOLDERS = {
  "dein-name",
  "your-name",
  "example",
}
ADMIN_SUBSCRIPTION_STATUSES = {
  "inactive",
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
}
ANALYTICS_EVENT_NAMES = {
  "app_open",
  "offer_view",
  "add_to_cart",
  "purchase_success",
  "membership_join",
  "reward_claim",
  "reward_redeem",
  "campaign_run",
  "campaign_delivery",
}
PATIENT_MEMBERSHIP_STATUSES = {
  "active",
  "past_due",
  "paused",
  "canceled",
  "inactive",
}
PATIENT_PAYMENT_STATUSES = {
  "paid",
  "past_due",
  "failed",
  "canceled",
  "pending",
}
STRIPE_TO_ADMIN_SUBSCRIPTION_STATUS = {
  "active": "active",
  "trialing": "trialing",
  "past_due": "past_due",
  "unpaid": "unpaid",
  "canceled": "canceled",
  "incomplete": "incomplete",
  "incomplete_expired": "inactive",
  "paused": "inactive",
}
SUPPORTED_CHECKOUT_PAYMENT_METHOD_TYPES = {
  "card",
  "paypal",
  "klarna",
  "link",
  "sepa_debit",
  "ideal",
  "sofort",
  "eps",
  "bancontact",
  "p24",
}
CAMPAIGN_TRIGGER_CHOICES = {
  "broadcast",
  "inactive_30d",
  "abandoned_cart_24h",
  "membership_past_due",
  "membership_canceled_winback",
}
CAMPAIGN_CHANNEL_CHOICES = {"in_app", "push", "email", "sms"}
CAMPAIGN_STATUS_CHOICES = {"draft", "active", "paused"}
PATIENT_MEMBERSHIP_BILLING_DAYS = 30
MOBILE_OTP_LENGTH = 6

try:
  MOBILE_OTP_TTL_SECONDS = max(60, min(int(os.getenv("MOBILE_OTP_TTL_SECONDS", "300")), 1800))
except ValueError:
  MOBILE_OTP_TTL_SECONDS = 300

try:
  MOBILE_OTP_MAX_ATTEMPTS = max(1, min(int(os.getenv("MOBILE_OTP_MAX_ATTEMPTS", "5")), 12))
except ValueError:
  MOBILE_OTP_MAX_ATTEMPTS = 5

try:
  MOBILE_OTP_RESEND_COOLDOWN_SECONDS = max(5, min(int(os.getenv("MOBILE_OTP_RESEND_COOLDOWN_SECONDS", "30")), 600))
except ValueError:
  MOBILE_OTP_RESEND_COOLDOWN_SECONDS = 30

MOBILE_OTP_DEBUG = os.getenv("MOBILE_OTP_DEBUG", "true").lower() in {"1", "true", "yes"}
MOBILE_OTP_BRAND_NAME = str(os.getenv("MOBILE_OTP_BRAND_NAME", "Appointmentix")).strip() or "Appointmentix"

DEFAULT_MOBILE_CATEGORIES = [
  {"id": "gesicht", "label": "Gesicht"},
  {"id": "haare", "label": "Haare"},
  {"id": "koerper", "label": "Körper"},
  {"id": "injectables", "label": "Injectables"},
  {"id": "premium", "label": "Premium"},
]
ALLOWED_UPLOAD_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024

DEFAULT_TREATMENT_GALLERY_URLS = [
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
]

TREATMENT_GALLERY_LIBRARY = [
  {
    "keywords": ["laser", "haar", "hair", "epilation", "soprano"],
    "urls": [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    "keywords": ["botox", "hyaluron", "filler", "inject", "lippen"],
    "urls": [
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    "keywords": ["needling", "microneedling", "peeling", "haut", "skin", "facial", "gesicht", "glow"],
    "urls": [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    "keywords": ["cellulite", "koerper", "body", "contour", "thermage"],
    "urls": [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    "keywords": ["prp", "mesohair", "kopfhaut", "scalp"],
    "urls": [
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    ],
  },
]


def is_postgres_url(value: str) -> bool:
  normalized = value.lower().strip()
  return normalized.startswith("postgres://") or normalized.startswith("postgresql://")


if is_postgres_url(DATABASE_URL):
  DB_BACKEND = "postgres"
else:
  DB_BACKEND = "sqlite"


def normalized_database_url() -> str:
  if not DATABASE_URL:
    return ""
  if DATABASE_URL.startswith("postgres://"):
    return "postgresql://" + DATABASE_URL[len("postgres://"):]
  return DATABASE_URL

if STRIPE_SECRET_KEY:
  stripe.api_key = STRIPE_SECRET_KEY

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
app.config["SECRET_KEY"] = APP_SECRET_KEY
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["JSON_AS_ASCII"] = False

if TRUST_PROXY:
  app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

if os.getenv("SESSION_COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}:
  app.config["SESSION_COOKIE_SECURE"] = True


def is_placeholder(value: str) -> bool:
  lowered = value.lower()
  return (not value) or ("xxxxx" in lowered) or ("ersetze" in lowered)


def stripe_runtime_ready() -> bool:
  return (
    not is_placeholder(STRIPE_SECRET_KEY)
    and not is_placeholder(STRIPE_PUBLISHABLE_KEY)
    and STRIPE_SECRET_KEY.startswith(("sk_test_", "sk_live_"))
    and STRIPE_PUBLISHABLE_KEY.startswith(("pk_test_", "pk_live_"))
  )


def superadmin_configured() -> bool:
  return bool(SUPERADMIN_EMAIL) and bool(SUPERADMIN_PASSWORD or SUPERADMIN_PASSWORD_HASH)


def verify_superadmin_password(raw_password: str) -> bool:
  if SUPERADMIN_PASSWORD_HASH:
    return check_password_hash(SUPERADMIN_PASSWORD_HASH, raw_password)
  if not SUPERADMIN_PASSWORD:
    return False
  return hmac.compare_digest(raw_password, SUPERADMIN_PASSWORD)


class DBConnectionAdapter:
  def __init__(self, connection, backend: str):
    self._connection = connection
    self.backend = backend

  def __enter__(self):
    return self

  def __exit__(self, exc_type, exc_value, traceback):
    try:
      if exc_type:
        self._connection.rollback()
      else:
        self._connection.commit()
    finally:
      self._connection.close()
    return False

  def _normalize_query(self, query: str) -> str:
    if self.backend != "postgres":
      return query
    return query.replace("?", "%s")

  def execute(self, query: str, params: tuple = ()):
    normalized_query = self._normalize_query(query)
    return self._connection.execute(normalized_query, params)

  def executescript(self, script: str):
    if self.backend != "postgres":
      return self._connection.executescript(script)

    statements = [statement.strip() for statement in script.split(";") if statement.strip()]
    for statement in statements:
      self._connection.execute(statement)
    return None


def get_db() -> DBConnectionAdapter:
  if DB_BACKEND == "postgres":
    if psycopg is None:
      raise RuntimeError("PostgreSQL aktiviert, aber psycopg ist nicht installiert.")
    connection = psycopg.connect(normalized_database_url(), row_factory=dict_row)
    return DBConnectionAdapter(connection, "postgres")

  connection = sqlite3.connect(DB_PATH)
  connection.row_factory = sqlite3.Row
  connection.execute("PRAGMA foreign_keys = ON;")
  return DBConnectionAdapter(connection, "sqlite")


def ensure_columns(conn: DBConnectionAdapter, table_name: str, definitions: dict[str, str]) -> None:
  if conn.backend == "postgres":
    rows = conn.execute(
      """
      SELECT column_name AS name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ?
      """,
      (table_name,),
    ).fetchall()
  else:
    rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()

  existing = {row["name"] for row in rows}
  for column, column_definition in definitions.items():
    if column not in existing:
      conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {column} {column_definition}")


def insert_and_get_id(conn: DBConnectionAdapter, insert_query: str, params: tuple) -> int:
  if conn.backend == "postgres":
    query = insert_query.strip().rstrip(";")
    if "RETURNING id" not in query.upper():
      query = f"{query} RETURNING id"
    row = conn.execute(query, params).fetchone()
    if not row:
      raise RuntimeError("Insert hat keine ID zurückgegeben.")
    return int(row["id"])

  cursor = conn.execute(insert_query, params)
  return int(cursor.lastrowid)


def ensure_clinic_memberships(conn: DBConnectionAdapter) -> None:
  users_without_clinic = conn.execute(
    """
    SELECT
      id,
      clinic_name,
      logo_url,
      website,
      brand_color,
      accent_color,
      font_family,
      design_preset,
      calendly_url,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id
    FROM users
    WHERE clinic_id IS NULL
    ORDER BY id ASC
    """
  ).fetchall()

  for user in users_without_clinic:
    clinic_id = insert_and_get_id(
      conn,
      """
      INSERT INTO clinics (
        name,
        logo_url,
        website,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        user["clinic_name"],
        user["logo_url"] or "",
        user["website"] or "",
        user["brand_color"] or "#16A34A",
        user["accent_color"] or "#EB6C13",
        user["font_family"] or "Gabarito, DM Sans, sans-serif",
        user["design_preset"] or "clean",
        user["calendly_url"] or CALENDLY_URL,
        user["subscription_status"] or "inactive",
        user["stripe_customer_id"],
        user["stripe_subscription_id"],
      ),
    )
    ensure_clinic_catalog_row(conn, int(clinic_id), str(user["clinic_name"]))

    conn.execute(
      """
      UPDATE users
      SET clinic_id = ?, role = COALESCE(NULLIF(role, ''), 'owner')
      WHERE id = ?
      """,
      (clinic_id, user["id"]),
    )

  conn.execute(
    """
    UPDATE users
    SET role = COALESCE(NULLIF(role, ''), 'owner')
    WHERE role IS NULL OR role = ''
    """
  )


def init_db() -> None:
  with get_db() as conn:
    if conn.backend == "postgres":
      conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS clinics (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          logo_url TEXT NOT NULL DEFAULT '',
          website TEXT NOT NULL DEFAULT '',
          brand_color TEXT NOT NULL DEFAULT '#16A34A',
          accent_color TEXT NOT NULL DEFAULT '#EB6C13',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          design_preset TEXT NOT NULL DEFAULT 'clean',
          calendly_url TEXT NOT NULL DEFAULT '',
          subscription_status TEXT NOT NULL DEFAULT 'inactive',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          clinic_id BIGINT,
          role TEXT NOT NULL DEFAULT 'owner',
          full_name TEXT NOT NULL,
          clinic_name TEXT NOT NULL,
          logo_url TEXT NOT NULL DEFAULT '',
          website TEXT NOT NULL DEFAULT '',
          brand_color TEXT NOT NULL DEFAULT '#16A34A',
          accent_color TEXT NOT NULL DEFAULT '#EB6C13',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          design_preset TEXT NOT NULL DEFAULT 'clean',
          calendly_url TEXT NOT NULL DEFAULT '',
          subscription_status TEXT NOT NULL DEFAULT 'inactive',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE TABLE IF NOT EXISTS payments (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          stripe_session_id TEXT UNIQUE,
          stripe_payment_intent_id TEXT,
          stripe_subscription_id TEXT,
          stripe_customer_id TEXT,
          item_name TEXT NOT NULL,
          item_type TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

        CREATE TABLE IF NOT EXISTS subscriptions (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT,
          stripe_session_id TEXT UNIQUE,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT UNIQUE,
          plan_name TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL,
          current_period_end TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);

        CREATE TABLE IF NOT EXISTS api_tokens (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_used_at TEXT,
          revoked_at TEXT,
          expires_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);

        CREATE TABLE IF NOT EXISTS mobile_phone_otps (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          request_id TEXT NOT NULL UNIQUE,
          phone_e164 TEXT NOT NULL,
          code_hash TEXT NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 5,
          expires_at TEXT NOT NULL,
          verified_at TEXT,
          delivery_status TEXT NOT NULL DEFAULT 'pending',
          delivery_error TEXT NOT NULL DEFAULT '',
          provider_message_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE INDEX IF NOT EXISTS idx_mobile_phone_otps_lookup ON mobile_phone_otps(clinic_id, phone_e164, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_mobile_phone_otps_request ON mobile_phone_otps(request_id);

        CREATE TABLE IF NOT EXISTS leads (
          id BIGSERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company_name TEXT NOT NULL,
          website TEXT NOT NULL,
          has_devices TEXT NOT NULL,
          recurring_revenue_band TEXT NOT NULL,
          consent_sms INTEGER NOT NULL DEFAULT 0,
          consent_marketing INTEGER NOT NULL DEFAULT 0,
          brand_color TEXT NOT NULL DEFAULT '#8A5A2F',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

        CREATE TABLE IF NOT EXISTS analytics_events (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          user_id BIGINT,
          event_name TEXT NOT NULL,
          treatment_id TEXT,
          amount_cents INTEGER,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          event_source TEXT NOT NULL DEFAULT 'unknown',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_analytics_events_clinic_created ON analytics_events(clinic_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

        CREATE TABLE IF NOT EXISTS clinic_catalogs (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL UNIQUE,
          categories_json TEXT NOT NULL DEFAULT '[]',
          treatments_json TEXT NOT NULL DEFAULT '[]',
          memberships_json TEXT NOT NULL DEFAULT '[]',
          reward_actions_json TEXT NOT NULL DEFAULT '[]',
          reward_redeems_json TEXT NOT NULL DEFAULT '[]',
          home_articles_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_catalogs_clinic_id ON clinic_catalogs(clinic_id);

        CREATE TABLE IF NOT EXISTS patient_memberships (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          patient_email TEXT NOT NULL,
          patient_name TEXT NOT NULL DEFAULT '',
          membership_id TEXT NOT NULL,
          membership_name TEXT NOT NULL,
          monthly_amount_cents INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL DEFAULT 'inactive',
          started_at TEXT,
          current_period_end TEXT,
          next_charge_at TEXT,
          canceled_at TEXT,
          last_payment_status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          UNIQUE (clinic_id, patient_email)
        );

        CREATE INDEX IF NOT EXISTS idx_patient_memberships_clinic_status ON patient_memberships(clinic_id, status);
        CREATE INDEX IF NOT EXISTS idx_patient_memberships_email ON patient_memberships(patient_email);

        CREATE TABLE IF NOT EXISTS clinic_campaigns (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          name TEXT NOT NULL,
          trigger_type TEXT NOT NULL DEFAULT 'broadcast',
          channel TEXT NOT NULL DEFAULT 'in_app',
          status TEXT NOT NULL DEFAULT 'draft',
          template_title TEXT NOT NULL DEFAULT '',
          template_body TEXT NOT NULL DEFAULT '',
          points_bonus INTEGER NOT NULL DEFAULT 0,
          last_run_at TEXT,
          next_run_at TEXT,
          total_runs INTEGER NOT NULL DEFAULT 0,
          total_audience INTEGER NOT NULL DEFAULT 0,
          created_by_user_id BIGINT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_clinic_campaigns_clinic_status ON clinic_campaigns(clinic_id, status);
        CREATE INDEX IF NOT EXISTS idx_clinic_campaigns_trigger ON clinic_campaigns(trigger_type);

        CREATE TABLE IF NOT EXISTS campaign_deliveries (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          campaign_id BIGINT NOT NULL,
          recipient_key TEXT NOT NULL,
          channel TEXT NOT NULL,
          status TEXT NOT NULL,
          provider_message_id TEXT,
          error_message TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (campaign_id) REFERENCES clinic_campaigns(id)
        );

        CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_campaign ON campaign_deliveries(campaign_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_clinic ON campaign_deliveries(clinic_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS audit_logs (
          id BIGSERIAL PRIMARY KEY,
          clinic_id BIGINT NOT NULL,
          actor_user_id BIGINT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL DEFAULT '',
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (actor_user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_created ON audit_logs(clinic_id, created_at DESC);
        """
      )
    else:
      conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS clinics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          logo_url TEXT NOT NULL DEFAULT '',
          website TEXT NOT NULL DEFAULT '',
          brand_color TEXT NOT NULL DEFAULT '#16A34A',
          accent_color TEXT NOT NULL DEFAULT '#EB6C13',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          design_preset TEXT NOT NULL DEFAULT 'clean',
          calendly_url TEXT NOT NULL DEFAULT '',
          subscription_status TEXT NOT NULL DEFAULT 'inactive',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          clinic_id INTEGER,
          role TEXT NOT NULL DEFAULT 'owner',
          full_name TEXT NOT NULL,
          clinic_name TEXT NOT NULL,
          logo_url TEXT NOT NULL DEFAULT '',
          website TEXT NOT NULL DEFAULT '',
          brand_color TEXT NOT NULL DEFAULT '#16A34A',
          accent_color TEXT NOT NULL DEFAULT '#EB6C13',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          design_preset TEXT NOT NULL DEFAULT 'clean',
          calendly_url TEXT NOT NULL DEFAULT '',
          subscription_status TEXT NOT NULL DEFAULT 'inactive',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          stripe_session_id TEXT UNIQUE,
          stripe_payment_intent_id TEXT,
          stripe_subscription_id TEXT,
          stripe_customer_id TEXT,
          item_name TEXT NOT NULL,
          item_type TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

        CREATE TABLE IF NOT EXISTS subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          stripe_session_id TEXT UNIQUE,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT UNIQUE,
          plan_name TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL,
          current_period_end TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);

        CREATE TABLE IF NOT EXISTS api_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_used_at TEXT,
          revoked_at TEXT,
          expires_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);

        CREATE TABLE IF NOT EXISTS mobile_phone_otps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          request_id TEXT NOT NULL UNIQUE,
          phone_e164 TEXT NOT NULL,
          code_hash TEXT NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 5,
          expires_at TEXT NOT NULL,
          verified_at TEXT,
          delivery_status TEXT NOT NULL DEFAULT 'pending',
          delivery_error TEXT NOT NULL DEFAULT '',
          provider_message_id TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE INDEX IF NOT EXISTS idx_mobile_phone_otps_lookup ON mobile_phone_otps(clinic_id, phone_e164, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_mobile_phone_otps_request ON mobile_phone_otps(request_id);

        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company_name TEXT NOT NULL,
          website TEXT NOT NULL,
          has_devices TEXT NOT NULL,
          recurring_revenue_band TEXT NOT NULL,
          consent_sms INTEGER NOT NULL DEFAULT 0,
          consent_marketing INTEGER NOT NULL DEFAULT 0,
          brand_color TEXT NOT NULL DEFAULT '#8A5A2F',
          font_family TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

        CREATE TABLE IF NOT EXISTS analytics_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          user_id INTEGER,
          event_name TEXT NOT NULL,
          treatment_id TEXT,
          amount_cents INTEGER,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          event_source TEXT NOT NULL DEFAULT 'unknown',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_analytics_events_clinic_created ON analytics_events(clinic_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

        CREATE TABLE IF NOT EXISTS clinic_catalogs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL UNIQUE,
          categories_json TEXT NOT NULL DEFAULT '[]',
          treatments_json TEXT NOT NULL DEFAULT '[]',
          memberships_json TEXT NOT NULL DEFAULT '[]',
          reward_actions_json TEXT NOT NULL DEFAULT '[]',
          reward_redeems_json TEXT NOT NULL DEFAULT '[]',
          home_articles_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id)
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_catalogs_clinic_id ON clinic_catalogs(clinic_id);

        CREATE TABLE IF NOT EXISTS patient_memberships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          patient_email TEXT NOT NULL,
          patient_name TEXT NOT NULL DEFAULT '',
          membership_id TEXT NOT NULL,
          membership_name TEXT NOT NULL,
          monthly_amount_cents INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'eur',
          status TEXT NOT NULL DEFAULT 'inactive',
          started_at TEXT,
          current_period_end TEXT,
          next_charge_at TEXT,
          canceled_at TEXT,
          last_payment_status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          UNIQUE (clinic_id, patient_email)
        );

        CREATE INDEX IF NOT EXISTS idx_patient_memberships_clinic_status ON patient_memberships(clinic_id, status);
        CREATE INDEX IF NOT EXISTS idx_patient_memberships_email ON patient_memberships(patient_email);

        CREATE TABLE IF NOT EXISTS clinic_campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          trigger_type TEXT NOT NULL DEFAULT 'broadcast',
          channel TEXT NOT NULL DEFAULT 'in_app',
          status TEXT NOT NULL DEFAULT 'draft',
          template_title TEXT NOT NULL DEFAULT '',
          template_body TEXT NOT NULL DEFAULT '',
          points_bonus INTEGER NOT NULL DEFAULT 0,
          last_run_at TEXT,
          next_run_at TEXT,
          total_runs INTEGER NOT NULL DEFAULT 0,
          total_audience INTEGER NOT NULL DEFAULT 0,
          created_by_user_id INTEGER,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_clinic_campaigns_clinic_status ON clinic_campaigns(clinic_id, status);
        CREATE INDEX IF NOT EXISTS idx_clinic_campaigns_trigger ON clinic_campaigns(trigger_type);

        CREATE TABLE IF NOT EXISTS campaign_deliveries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          campaign_id INTEGER NOT NULL,
          recipient_key TEXT NOT NULL,
          channel TEXT NOT NULL,
          status TEXT NOT NULL,
          provider_message_id TEXT,
          error_message TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (campaign_id) REFERENCES clinic_campaigns(id)
        );

        CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_campaign ON campaign_deliveries(campaign_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_clinic ON campaign_deliveries(clinic_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clinic_id INTEGER NOT NULL,
          actor_user_id INTEGER,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL DEFAULT '',
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clinic_id) REFERENCES clinics(id),
          FOREIGN KEY (actor_user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic_created ON audit_logs(clinic_id, created_at DESC);
        """
      )

    ensure_columns(
      conn,
      "clinics",
      {
        "logo_url": "TEXT NOT NULL DEFAULT ''",
        "website": "TEXT NOT NULL DEFAULT ''",
        "brand_color": "TEXT NOT NULL DEFAULT '#16A34A'",
        "accent_color": "TEXT NOT NULL DEFAULT '#EB6C13'",
        "font_family": "TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif'",
        "design_preset": "TEXT NOT NULL DEFAULT 'clean'",
        "calendly_url": "TEXT NOT NULL DEFAULT ''",
        "subscription_status": "TEXT NOT NULL DEFAULT 'inactive'",
        "stripe_customer_id": "TEXT",
        "stripe_subscription_id": "TEXT",
      },
    )

    ensure_columns(
      conn,
      "users",
      {
        "clinic_id": "INTEGER",
        "role": "TEXT NOT NULL DEFAULT 'owner'",
        "logo_url": "TEXT NOT NULL DEFAULT ''",
        "website": "TEXT NOT NULL DEFAULT ''",
        "brand_color": "TEXT NOT NULL DEFAULT '#16A34A'",
        "accent_color": "TEXT NOT NULL DEFAULT '#EB6C13'",
        "font_family": "TEXT NOT NULL DEFAULT 'Gabarito, DM Sans, sans-serif'",
        "design_preset": "TEXT NOT NULL DEFAULT 'clean'",
        "calendly_url": "TEXT NOT NULL DEFAULT ''",
        "subscription_status": "TEXT NOT NULL DEFAULT 'inactive'",
        "stripe_customer_id": "TEXT",
        "stripe_subscription_id": "TEXT",
      },
    )

    ensure_columns(
      conn,
      "analytics_events",
      {
        "metadata_json": "TEXT NOT NULL DEFAULT '{}'",
        "event_source": "TEXT NOT NULL DEFAULT 'unknown'",
      },
    )

    ensure_columns(
      conn,
      "clinic_catalogs",
      {
        "categories_json": "TEXT NOT NULL DEFAULT '[]'",
        "treatments_json": "TEXT NOT NULL DEFAULT '[]'",
        "memberships_json": "TEXT NOT NULL DEFAULT '[]'",
        "reward_actions_json": "TEXT NOT NULL DEFAULT '[]'",
        "reward_redeems_json": "TEXT NOT NULL DEFAULT '[]'",
        "home_articles_json": "TEXT NOT NULL DEFAULT '[]'",
      },
    )

    ensure_columns(
      conn,
      "patient_memberships",
      {
        "patient_name": "TEXT NOT NULL DEFAULT ''",
        "membership_name": "TEXT NOT NULL DEFAULT ''",
        "monthly_amount_cents": "INTEGER NOT NULL DEFAULT 0",
        "currency": "TEXT NOT NULL DEFAULT 'eur'",
        "status": "TEXT NOT NULL DEFAULT 'inactive'",
        "started_at": "TEXT",
        "current_period_end": "TEXT",
        "next_charge_at": "TEXT",
        "canceled_at": "TEXT",
        "last_payment_status": "TEXT NOT NULL DEFAULT 'pending'",
      },
    )

    ensure_columns(
      conn,
      "clinic_campaigns",
      {
        "trigger_type": "TEXT NOT NULL DEFAULT 'broadcast'",
        "channel": "TEXT NOT NULL DEFAULT 'in_app'",
        "status": "TEXT NOT NULL DEFAULT 'draft'",
        "template_title": "TEXT NOT NULL DEFAULT ''",
        "template_body": "TEXT NOT NULL DEFAULT ''",
        "points_bonus": "INTEGER NOT NULL DEFAULT 0",
        "last_run_at": "TEXT",
        "next_run_at": "TEXT",
        "total_runs": "INTEGER NOT NULL DEFAULT 0",
        "total_audience": "INTEGER NOT NULL DEFAULT 0",
        "created_by_user_id": "INTEGER",
      },
    )

    ensure_columns(
      conn,
      "audit_logs",
      {
        "entity_id": "TEXT NOT NULL DEFAULT ''",
        "metadata_json": "TEXT NOT NULL DEFAULT '{}'",
      },
    )

    ensure_columns(
      conn,
      "campaign_deliveries",
      {
        "provider_message_id": "TEXT",
        "error_message": "TEXT",
        "metadata_json": "TEXT NOT NULL DEFAULT '{}'",
      },
    )

    conn.execute("CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id)")

    ensure_clinic_memberships(conn)
    ensure_clinic_catalog_rows(conn)


def serialize_user(row: sqlite3.Row) -> dict:
  return {
    "id": row["id"],
    "clinicId": row["clinic_id"],
    "role": row["role"],
    "email": row["email"],
    "fullName": row["full_name"],
    "clinicName": row["clinic_name"],
    "logoUrl": row["logo_url"],
    "website": row["website"],
    "brandColor": row["brand_color"],
    "accentColor": row["accent_color"],
    "fontFamily": row["font_family"],
    "designPreset": row["design_preset"],
    "calendlyUrl": row["calendly_url"],
    "subscriptionStatus": row["subscription_status"],
    "createdAt": row["created_at"],
  }


def get_user_row_by_id(user_id: int) -> sqlite3.Row | None:
  with get_db() as conn:
    row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        role,
        email,
        full_name,
        clinic_name,
        logo_url,
        website,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      FROM users
      WHERE id = ?
      """,
      (user_id,),
    ).fetchone()
  return row


def utc_now() -> datetime:
  return datetime.now(timezone.utc)


def utc_now_iso() -> str:
  return utc_now().isoformat()


def hash_api_token(raw_token: str) -> str:
  return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def parse_bearer_token() -> str:
  auth_header = str(request.headers.get("Authorization", "")).strip()
  if not auth_header:
    return ""
  scheme, _, token = auth_header.partition(" ")
  if scheme.lower() != "bearer":
    return ""
  return token.strip()


def token_is_expired(raw_expires_at: str) -> bool:
  if not raw_expires_at:
    return True
  try:
    parsed = datetime.fromisoformat(raw_expires_at)
  except ValueError:
    return True
  if parsed.tzinfo is None:
    parsed = parsed.replace(tzinfo=timezone.utc)
  return parsed <= utc_now()


def parse_datetime_utc(raw_value: object) -> datetime | None:
  raw_text = str(raw_value or "").strip()
  if not raw_text:
    return None

  candidate = raw_text.replace("Z", "+00:00")
  try:
    parsed = datetime.fromisoformat(candidate)
  except ValueError:
    try:
      parsed = datetime.strptime(raw_text, "%Y-%m-%d %H:%M:%S")
    except ValueError:
      return None

  if parsed.tzinfo is None:
    parsed = parsed.replace(tzinfo=timezone.utc)
  return parsed


def issue_api_token(user_id: int) -> str:
  raw_token = f"ax_{secrets.token_urlsafe(32)}"
  token_hash = hash_api_token(raw_token)
  expires_at = (utc_now() + timedelta(days=API_TOKEN_TTL_DAYS)).isoformat()

  with get_db() as conn:
    conn.execute(
      """
      INSERT INTO api_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      """,
      (user_id, token_hash, expires_at),
    )

  return raw_token


def resolve_user_id_from_api_token(raw_token: str) -> int | None:
  if not raw_token:
    return None

  token_hash = hash_api_token(raw_token)
  now_iso = utc_now_iso()

  with get_db() as conn:
    row = conn.execute(
      """
      SELECT
        id,
        user_id,
        revoked_at,
        expires_at
      FROM api_tokens
      WHERE token_hash = ?
      LIMIT 1
      """,
      (token_hash,),
    ).fetchone()

    if not row:
      return None
    if row["revoked_at"] is not None:
      return None
    if token_is_expired(str(row["expires_at"] or "")):
      return None

    conn.execute(
      """
      UPDATE api_tokens
      SET last_used_at = ?
      WHERE id = ?
      """,
      (now_iso, row["id"]),
    )

    return int(row["user_id"])


def revoke_api_token(raw_token: str) -> None:
  if not raw_token:
    return

  token_hash = hash_api_token(raw_token)
  with get_db() as conn:
    conn.execute(
      """
      UPDATE api_tokens
      SET revoked_at = COALESCE(revoked_at, ?)
      WHERE token_hash = ?
      """,
      (utc_now_iso(), token_hash),
    )


def revoke_all_user_tokens(user_id: int) -> None:
  with get_db() as conn:
    conn.execute(
      """
      UPDATE api_tokens
      SET revoked_at = COALESCE(revoked_at, ?)
      WHERE user_id = ?
      """,
      (utc_now_iso(), user_id),
    )


def get_current_user_row() -> sqlite3.Row | None:
  bearer_token = parse_bearer_token()
  if bearer_token:
    user_id_from_token = resolve_user_id_from_api_token(bearer_token)
    if user_id_from_token:
      row = get_user_row_by_id(user_id_from_token)
      if row:
        return row

  user_id = session.get("user_id")
  if not user_id:
    return None
  return get_user_row_by_id(int(user_id))


def require_auth_row() -> tuple[sqlite3.Row | None, tuple]:
  user_row = get_current_user_row()
  if not user_row:
    return None, (jsonify({"error": "Nicht angemeldet."}), 401)
  return user_row, ()


def require_owner_row() -> tuple[sqlite3.Row | None, tuple]:
  user_row, auth_error = require_auth_row()
  if not user_row:
    return None, auth_error
  role = str(user_row["role"]) if ("role" in user_row.keys()) else "owner"
  if role != "owner":
    return None, (jsonify({"error": "Nur Owner dürfen diese Aktion ausführen."}), 403)
  return user_row, ()


def is_superadmin_session_active() -> bool:
  if not superadmin_configured():
    return False
  return bool(session.get("superadmin_authenticated")) and str(session.get("superadmin_email", "")).lower() == SUPERADMIN_EMAIL


def require_superadmin() -> tuple[dict | None, tuple]:
  if not superadmin_configured():
    return None, (jsonify({"error": "Super-Admin ist nicht konfiguriert."}), 503)
  if not is_superadmin_session_active():
    return None, (jsonify({"error": "Super-Admin nicht angemeldet."}), 401)
  return {"email": SUPERADMIN_EMAIL}, ()


def is_unique_violation(exc: Exception) -> bool:
  if isinstance(exc, sqlite3.IntegrityError):
    return True
  if psycopg is not None:
    if isinstance(exc, psycopg.errors.UniqueViolation):
      return True
    if isinstance(exc, psycopg.IntegrityError) and "unique" in str(exc).lower():
      return True
  return "unique" in str(exc).lower()


def get_clinic_row_by_id(clinic_id: int | None):
  if not clinic_id:
    return None
  with get_db() as conn:
    row = conn.execute(
      """
      SELECT
        id,
        name,
        website,
        logo_url,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      FROM clinics
      WHERE id = ?
      LIMIT 1
      """,
      (clinic_id,),
    ).fetchone()
  return row


def serialize_admin_clinic(row) -> dict:
  return {
    "id": row["id"],
    "name": row["name"],
    "website": row["website"],
    "logoUrl": row["logo_url"],
    "brandColor": row["brand_color"],
    "accentColor": row["accent_color"],
    "fontFamily": row["font_family"],
    "designPreset": row["design_preset"],
    "calendlyUrl": row["calendly_url"],
    "subscriptionStatus": row["subscription_status"],
    "stripeCustomerId": row["stripe_customer_id"],
    "stripeSubscriptionId": row["stripe_subscription_id"],
    "createdAt": row["created_at"],
  }


def get_clinic_row_by_name(clinic_name: str):
  normalized = clinic_name.strip().lower()
  if not normalized:
    return None

  pattern = f"%{normalized}%"
  with get_db() as conn:
    exact = conn.execute(
      """
      SELECT
        id,
        name,
        website,
        logo_url,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      FROM clinics
      WHERE LOWER(name) = ?
      LIMIT 1
      """,
      (normalized,),
    ).fetchone()

    if exact:
      return exact

    fuzzy = conn.execute(
      """
      SELECT
        id,
        name,
        website,
        logo_url,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      FROM clinics
      WHERE LOWER(name) LIKE ?
      ORDER BY id ASC
      LIMIT 1
      """,
      (pattern,),
    ).fetchone()
    return fuzzy


def serialize_public_clinic(row) -> dict:
  name = str(row["name"] or "")
  return {
    "id": row["id"],
    "name": name,
    "shortName": build_clinic_short_name(name),
    "city": "",
    "website": row["website"],
    "logoUrl": row["logo_url"],
    "brandColor": row["brand_color"],
    "accentColor": row["accent_color"],
  }


def search_clinics_for_mobile(query: str, limit: int = 10) -> list[dict]:
  normalized_query = normalize_keyword_text(query)
  safe_limit = max(1, min(int(limit), 25))
  with get_db() as conn:
    if normalized_query:
      like_pattern = f"%{normalized_query}%"
      prefix_pattern = f"{normalized_query}%"
      rows = conn.execute(
        """
        SELECT
          id,
          name,
          website,
          logo_url,
          brand_color,
          accent_color,
          created_at
        FROM clinics
        WHERE LOWER(name) LIKE ?
        ORDER BY
          CASE
            WHEN LOWER(name) = ? THEN 0
            WHEN LOWER(name) LIKE ? THEN 1
            ELSE 2
          END,
          created_at DESC,
          id DESC
        LIMIT ?
        """,
        (like_pattern, normalized_query, prefix_pattern, safe_limit),
      ).fetchall()
    else:
      rows = conn.execute(
        """
        SELECT
          id,
          name,
          website,
          logo_url,
          brand_color,
          accent_color,
          created_at
        FROM clinics
        ORDER BY created_at DESC, id DESC
        LIMIT ?
        """,
        (safe_limit,),
      ).fetchall()

  return [serialize_public_clinic(row) for row in rows]


def extract_clinic_code_candidates(raw_code: str) -> list[str]:
  code = str(raw_code or "").strip()
  if not code:
    return []

  candidates: list[str] = []
  seen: set[str] = set()

  def push(value: object) -> None:
    text = unquote_plus(str(value or "").strip())
    if not text or text in seen:
      return
    seen.add(text)
    candidates.append(text)

  push(code)
  lower_code = code.lower()
  if lower_code.startswith("clinic:"):
    push(code[7:])
  if lower_code.startswith("appointmentix://clinic/"):
    push(code[len("appointmentix://clinic/"):])

  parsed = urlparse(code)
  if parsed.scheme:
    query_params = parse_qs(parsed.query or "", keep_blank_values=False)
    for key in ("clinic", "clinicname", "name", "c", "code", "ref"):
      for value in query_params.get(key, []):
        push(value)
    path_parts = [part for part in (parsed.path or "").split("/") if part]
    if path_parts:
      push(path_parts[-1])
      if "clinic" in [part.lower() for part in path_parts]:
        clinic_index = [part.lower() for part in path_parts].index("clinic")
        if clinic_index + 1 < len(path_parts):
          push(path_parts[clinic_index + 1])

  return candidates


def resolve_clinic_row_from_mobile_code(raw_code: str):
  candidates = extract_clinic_code_candidates(raw_code)
  if not candidates:
    return None

  for candidate in candidates:
    row = get_clinic_row_by_name(candidate)
    if row:
      return row

    if candidate.isdigit():
      row = get_clinic_row_by_id(int(candidate))
      if row:
        return row

    normalized_candidate = normalize_keyword_text(candidate)
    if not normalized_candidate:
      continue
    search_matches = search_clinics_for_mobile(candidate, limit=12)
    for match in search_matches:
      match_name = normalize_keyword_text(match.get("name"))
      match_short_name = normalize_keyword_text(match.get("shortName"))
      if normalized_candidate in {match_name, match_short_name}:
        row = get_clinic_row_by_id(int(match["id"]))
        if row:
          return row

  return None


def parse_json_list(raw_value: object) -> list:
  if isinstance(raw_value, list):
    return raw_value
  if raw_value is None:
    return []
  try:
    parsed = json.loads(str(raw_value))
  except Exception:
    return []
  if isinstance(parsed, list):
    return parsed
  return []


def serialize_json_list(values: list) -> str:
  if not isinstance(values, list):
    return "[]"
  try:
    return json.dumps(values, ensure_ascii=False, separators=(",", ":"))
  except Exception:
    return "[]"


def normalize_keyword_text(value: object) -> str:
  normalized = str(value or "").lower()
  replacements = {
    "ä": "ae",
    "ö": "oe",
    "ü": "ue",
    "ß": "ss",
  }
  for source, target in replacements.items():
    normalized = normalized.replace(source, target)
  normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
  return re.sub(r"\s+", " ", normalized).strip()


def normalize_treatment_gallery_urls(value: object) -> list[str]:
  if isinstance(value, list):
    candidates = value
  else:
    candidates = []

  urls: list[str] = []
  seen: set[str] = set()
  for candidate in candidates:
    url = str(candidate or "").strip()
    if not url:
      continue
    if not url.startswith(("http://", "https://", "/uploads/")):
      continue
    if url in seen:
      continue
    seen.add(url)
    urls.append(url)
    if len(urls) >= 8:
      break
  return urls


def infer_treatment_gallery_urls(treatment: dict) -> list[str]:
  name = str(treatment.get("name") or "")
  description = str(treatment.get("description") or "")
  category = str(treatment.get("category") or "")
  haystack = normalize_keyword_text(f"{name} {description} {category}")

  ranked: list[tuple[int, list[str]]] = []
  for item in TREATMENT_GALLERY_LIBRARY:
    keywords = [normalize_keyword_text(entry) for entry in item.get("keywords", [])]
    score = 0
    for keyword in keywords:
      if keyword and keyword in haystack:
        score += 1
    if score > 0:
      ranked.append((score, item.get("urls", [])))

  ranked.sort(key=lambda row: row[0], reverse=True)
  candidate_lists = [row[1] for row in ranked] or [DEFAULT_TREATMENT_GALLERY_URLS]

  output: list[str] = []
  seen: set[str] = set()
  for url_list in candidate_lists:
    for raw_url in url_list:
      url = str(raw_url or "").strip()
      if not url:
        continue
      if url in seen:
        continue
      seen.add(url)
      output.append(url)
      if len(output) >= 5:
        return output
  return output


def apply_auto_gallery_to_catalog(catalog: dict, overwrite_existing: bool = False) -> dict:
  treatments = catalog.get("treatments")
  if not isinstance(treatments, list):
    return catalog

  normalized_treatments = []
  for raw_treatment in treatments:
    if not isinstance(raw_treatment, dict):
      continue
    treatment = dict(raw_treatment)

    existing_image_url = str(treatment.get("imageUrl") or "").strip()
    existing_gallery = normalize_treatment_gallery_urls(treatment.get("galleryUrls"))
    inferred_gallery = infer_treatment_gallery_urls(treatment)

    if overwrite_existing or not existing_gallery:
      treatment["galleryUrls"] = inferred_gallery
    else:
      treatment["galleryUrls"] = existing_gallery

    if overwrite_existing or not existing_image_url:
      treatment["imageUrl"] = treatment["galleryUrls"][0] if treatment["galleryUrls"] else existing_image_url
    else:
      treatment["imageUrl"] = existing_image_url

    normalized_treatments.append(treatment)

  catalog["treatments"] = normalized_treatments
  return catalog


def build_default_mobile_catalog(clinic_name: str) -> dict:
  normalized_name = clinic_name.strip() or "Appointmentix Clinic"
  lower_name = normalized_name.lower()

  if any(keyword in lower_name for keyword in ("milani", "momi", "moser")):
    memberships = [
      {
        "id": "silber",
        "name": "MOMI Silber",
        "priceCents": 7900,
        "perks": [
          "1x Basic Glow pro Monat inklusive",
          "10% Rabatt auf Zusatzbehandlungen",
          "Priorisierte Termin-Slots",
          "Frühzugang zu Aktionen",
        ],
        "includedTreatmentIds": ["t-basic-glow"],
      },
      {
        "id": "gold",
        "name": "MOMI Gold",
        "priceCents": 14900,
        "perks": [
          "1x Premium-Treatment bis 190 EUR/Monat",
          "15% Rabatt auf Zusatzbehandlungen",
          "VIP-Support + Terminpriorität",
          "Exklusive Quartals-Events",
        ],
        "includedTreatmentIds": ["t-microdermabrasion", "t-med-peeling"],
      },
    ]
    home_articles = [
      {
        "id": "art-1",
        "title": "Warum juckt meine Kopfhaut?",
        "body": "Trockene Kopfhaut kann auf Irritationen oder fehlende Feuchtigkeit hinweisen. Unsere PRP + Mesohair-Kombi unterstützt die Regeneration.",
        "tag": "Education",
      },
      {
        "id": "art-2",
        "title": "Botox natürlich einsetzen",
        "body": "Der Fokus liegt auf frischem Ausdruck statt maskenhaftem Ergebnis. Unser Team plant die Dosis individuell je Mimikzone.",
        "tag": "Ästhetik",
      },
    ]
    treatments = [
      {
        "id": "t-basic-glow",
        "name": "Basic Glow",
        "category": "gesicht",
        "priceCents": 11000,
        "memberPriceCents": 0,
        "durationMinutes": 60,
        "description": "Intensive Zellregeneration für jede Lebensphase. Ideal als monatlicher Fresh-up Termin.",
      },
      {
        "id": "t-microdermabrasion",
        "name": "Mikrodermabrasion",
        "category": "gesicht",
        "priceCents": 13000,
        "memberPriceCents": 9900,
        "durationMinutes": 60,
        "description": "Klärende hauterneuernde Kombination aus Mikrodermabrasion und aufbauendem Ultraschall.",
      },
      {
        "id": "t-med-peeling",
        "name": "Medizinisches Peeling",
        "category": "gesicht",
        "priceCents": 19000,
        "memberPriceCents": 16150,
        "durationMinutes": 50,
        "description": "Fruchtsäure- und Wirkstoffkonzept bei Akne, Pigmenten und ersten Fältchen.",
      },
      {
        "id": "t-microneedling",
        "name": "Microneedling",
        "category": "gesicht",
        "priceCents": 32500,
        "memberPriceCents": 27625,
        "durationMinutes": 60,
        "description": "Medizinisches Needling zur Kollagenstimulation und Verfeinerung des Hautbilds.",
      },
      {
        "id": "t-clear-brilliant",
        "name": "Clear + Brilliant Laser",
        "category": "premium",
        "priceCents": 59000,
        "memberPriceCents": 53100,
        "durationMinutes": 45,
        "description": "Schonende Laserbehandlung für Hautbild, Poren und Glow ohne lange Ausfallzeit.",
      },
      {
        "id": "t-fraxel",
        "name": "Fraxel Dual Laser",
        "category": "premium",
        "priceCents": 75000,
        "memberPriceCents": 67500,
        "durationMinutes": 60,
        "description": "Regenerative Laserimpulse für Narben, Sonnenschäden und feine Linien.",
      },
      {
        "id": "t-laser-hair",
        "name": "Laser-Haarentfernung",
        "category": "haare",
        "priceCents": 9000,
        "memberPriceCents": 7650,
        "durationMinutes": 30,
        "description": "Soprano ICE Technologie für nahezu schmerzfreie dauerhafte Haarentfernung.",
      },
      {
        "id": "t-prp",
        "name": "PRP Mesohair",
        "category": "haare",
        "priceCents": 68000,
        "memberPriceCents": 61200,
        "durationMinutes": 60,
        "description": "Eigenplasma-Behandlung zur Stärkung von Haarwurzel und Kopfhaut.",
      },
      {
        "id": "t-botox",
        "name": "Botox Gesicht",
        "category": "injectables",
        "priceCents": 36000,
        "memberPriceCents": 32400,
        "durationMinutes": 30,
        "description": "Mimische Falten glätten und frischen Ausdruck bewahren, ohne starren Look.",
      },
      {
        "id": "t-lippen",
        "name": "Hyaluron Lippen",
        "category": "injectables",
        "priceCents": 58000,
        "memberPriceCents": 52200,
        "durationMinutes": 45,
        "description": "Kontur, Feuchtigkeit und Volumen für ein natürlich harmonisches Lippenbild.",
      },
      {
        "id": "t-thermage-face",
        "name": "Thermage Gesicht + Hals",
        "category": "premium",
        "priceCents": 390000,
        "memberPriceCents": 370500,
        "durationMinutes": 75,
        "description": "Nicht-invasive Radiofrequenz für Straffung und Kollagenaufbau ohne Operation.",
      },
      {
        "id": "t-cellulite-awt",
        "name": "Cellulite AWT",
        "category": "koerper",
        "priceCents": 9000,
        "memberPriceCents": 8100,
        "durationMinutes": 30,
        "description": "Akustische Wellentherapie zur Verbesserung der Hautstruktur bei Cellulite.",
      },
    ]
  else:
    memberships = [
      {
        "id": "starter",
        "name": f"{normalized_name} Starter",
        "priceCents": 8900,
        "perks": [
          "1 inkludierte Monatsbehandlung",
          "10% Rabatt auf weitere Treatments",
          "Priority Booking",
        ],
        "includedTreatmentIds": ["t-skin-refresh"],
      }
    ]
    home_articles = [
      {
        "id": "art-default-1",
        "title": "Skin Refresh für jede Saison",
        "body": "Regelmäßige, leichte Treatments helfen bei Glow, Feuchtigkeit und Ebenmäßigkeit.",
        "tag": "Tipps",
      }
    ]
    treatments = [
      {
        "id": "t-skin-refresh",
        "name": "Skin Refresh",
        "category": "gesicht",
        "priceCents": 14900,
        "memberPriceCents": 0,
        "durationMinutes": 45,
        "description": "Sanfter Monats-Refresh für Glow und klare Haut.",
      },
      {
        "id": "t-laser-basic",
        "name": "Laser Basic",
        "category": "haare",
        "priceCents": 9900,
        "memberPriceCents": 8500,
        "durationMinutes": 30,
        "description": "Einstiegsbehandlung für dauerhafte Haarreduktion.",
      },
      {
        "id": "t-injectables-classic",
        "name": "Injectables Classic",
        "category": "injectables",
        "priceCents": 29000,
        "memberPriceCents": 26100,
        "durationMinutes": 30,
        "description": "Individuelle Behandlung für einen natürlichen, frischen Look.",
      },
    ]

  return {
    "categories": DEFAULT_MOBILE_CATEGORIES,
    "treatments": treatments,
    "memberships": memberships,
    "rewardActions": [
      {"id": "referral", "label": "Freund:in werben", "points": 150},
      {"id": "review", "label": "Google-Bewertung abgeben", "points": 120},
      {"id": "story", "label": "Vorher/Nachher-Freigabe", "points": 180},
    ],
    "rewardRedeems": [
      {"id": "r15", "label": "15 EUR Guthaben", "requiredPoints": 250, "valueCents": 1500},
      {"id": "r35", "label": "35 EUR Guthaben", "requiredPoints": 500, "valueCents": 3500},
      {"id": "r80", "label": "80 EUR Guthaben", "requiredPoints": 1000, "valueCents": 8000},
    ],
    "homeArticles": home_articles,
  }


def ensure_clinic_catalog_row(conn: DBConnectionAdapter, clinic_id: int, clinic_name: str) -> None:
  existing = conn.execute(
    """
    SELECT id
    FROM clinic_catalogs
    WHERE clinic_id = ?
    LIMIT 1
    """,
    (clinic_id,),
  ).fetchone()
  if existing:
    return

  catalog = build_default_mobile_catalog(clinic_name)
  conn.execute(
    """
    INSERT INTO clinic_catalogs (
      clinic_id,
      categories_json,
      treatments_json,
      memberships_json,
      reward_actions_json,
      reward_redeems_json,
      home_articles_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
    (
      clinic_id,
      serialize_json_list(catalog["categories"]),
      serialize_json_list(catalog["treatments"]),
      serialize_json_list(catalog["memberships"]),
      serialize_json_list(catalog["rewardActions"]),
      serialize_json_list(catalog["rewardRedeems"]),
      serialize_json_list(catalog["homeArticles"]),
    ),
  )


def ensure_clinic_catalog_rows(conn: DBConnectionAdapter) -> None:
  clinic_rows = conn.execute(
    """
    SELECT id, name
    FROM clinics
    ORDER BY id ASC
    """
  ).fetchall()
  for clinic_row in clinic_rows:
    ensure_clinic_catalog_row(conn, int(clinic_row["id"]), str(clinic_row["name"]))


def load_clinic_catalog_bundle(clinic_row) -> dict:
  clinic_id = int(clinic_row["id"])
  clinic_name = str(clinic_row["name"])

  with get_db() as conn:
    ensure_clinic_catalog_row(conn, clinic_id, clinic_name)
    catalog_row = conn.execute(
      """
      SELECT
        categories_json,
        treatments_json,
        memberships_json,
        reward_actions_json,
        reward_redeems_json,
        home_articles_json
      FROM clinic_catalogs
      WHERE clinic_id = ?
      LIMIT 1
      """,
      (clinic_id,),
    ).fetchone()

  if not catalog_row:
    default_catalog = build_default_mobile_catalog(clinic_name)
    return apply_auto_gallery_to_catalog(
      {
        "categories": default_catalog["categories"],
        "treatments": default_catalog["treatments"],
        "memberships": default_catalog["memberships"],
        "rewardActions": default_catalog["rewardActions"],
        "rewardRedeems": default_catalog["rewardRedeems"],
        "homeArticles": default_catalog["homeArticles"],
      },
      overwrite_existing=False,
    )

  return apply_auto_gallery_to_catalog(
    {
      "categories": parse_json_list(catalog_row["categories_json"]),
      "treatments": parse_json_list(catalog_row["treatments_json"]),
      "memberships": parse_json_list(catalog_row["memberships_json"]),
      "rewardActions": parse_json_list(catalog_row["reward_actions_json"]),
      "rewardRedeems": parse_json_list(catalog_row["reward_redeems_json"]),
      "homeArticles": parse_json_list(catalog_row["home_articles_json"]),
    },
    overwrite_existing=False,
  )


def build_clinic_short_name(clinic_name: str) -> str:
  parts = [part for part in clinic_name.split() if part]
  if not parts:
    return "APP"
  initials = "".join(part[0] for part in parts[:4]).upper()
  if len(initials) >= 2:
    return initials
  return clinic_name[:4].upper()


def clinic_upload_directory(clinic_id: int) -> Path:
  root = BASE_DIR / "uploads" / f"clinic_{clinic_id}"
  root.mkdir(parents=True, exist_ok=True)
  return root


def file_public_url(file_path: Path) -> str:
  relative = file_path.relative_to(BASE_DIR).as_posix()
  return f"/{relative}"


def is_allowed_image_filename(filename: str) -> bool:
  suffix = Path(filename).suffix.lower()
  return suffix in ALLOWED_UPLOAD_IMAGE_EXTENSIONS


def sanitize_patient_email(value: object) -> str:
  email = str(value or "").strip().lower()
  if len(email) > 180:
    email = email[:180]
  if "@" not in email or "." not in email:
    return ""
  return email


def sanitize_patient_name(value: object) -> str:
  name = str(value or "").strip()
  if len(name) > 120:
    name = name[:120]
  return name


def sanitize_phone_e164(value: object) -> str:
  raw = str(value or "").strip()
  if not raw:
    return ""

  normalized = re.sub(r"[^\d+]", "", raw)
  if normalized.startswith("00"):
    normalized = f"+{normalized[2:]}"

  digits = re.sub(r"\D", "", normalized)
  if len(digits) < 8 or len(digits) > 15:
    return ""
  return f"+{digits}"


def mask_phone_for_display(phone_e164: str) -> str:
  digits = re.sub(r"\D", "", str(phone_e164 or ""))
  if len(digits) <= 4:
    return phone_e164
  masked_count = len(digits) - 4
  return f"+{'*' * masked_count}{digits[-4:]}"


def generate_mobile_otp_code() -> str:
  upper_bound = 10 ** MOBILE_OTP_LENGTH
  return str(secrets.randbelow(upper_bound)).zfill(MOBILE_OTP_LENGTH)


def hash_mobile_otp_code(request_id: str, raw_code: str) -> str:
  payload = f"{request_id}:{raw_code}:{APP_SECRET_KEY}"
  return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def normalize_mobile_otp_code(value: object) -> str:
  return re.sub(r"\D", "", str(value or "").strip())


def mobile_otp_error_payload(message: str, error_code: str, **extra) -> dict:
  payload = {
    "success": False,
    "error": str(message or "OTP-Anfrage fehlgeschlagen."),
    "errorCode": str(error_code or "OTP_ERROR"),
  }
  for key, value in extra.items():
    if value is not None:
      payload[key] = value
  return payload


def issue_mobile_phone_otp(clinic_id: int, phone_e164: str):
  now = utc_now()
  with get_db() as conn:
    latest_row = conn.execute(
      """
      SELECT id, created_at
      FROM mobile_phone_otps
      WHERE clinic_id = ? AND phone_e164 = ?
      ORDER BY id DESC
      LIMIT 1
      """,
      (clinic_id, phone_e164),
    ).fetchone()

  if latest_row:
    latest_created = parse_datetime_utc(latest_row["created_at"])
    if latest_created is not None:
      cooldown_end = latest_created + timedelta(seconds=MOBILE_OTP_RESEND_COOLDOWN_SECONDS)
      if cooldown_end > now:
        seconds_left = max(1, int((cooldown_end - now).total_seconds()))
        return (
          mobile_otp_error_payload(
            f"Bitte warte {seconds_left}s, bevor du einen neuen Code anforderst.",
            "OTP_COOLDOWN",
            retryAfterSeconds=seconds_left,
            resendAfterSeconds=seconds_left,
          ),
          429,
        )

  request_id = f"otp_{secrets.token_urlsafe(18)}"
  raw_code = generate_mobile_otp_code()
  code_hash = hash_mobile_otp_code(request_id, raw_code)
  expires_at = (now + timedelta(seconds=MOBILE_OTP_TTL_SECONDS)).isoformat()

  with get_db() as conn:
    # A newer request invalidates all previous unverified requests for this phone.
    conn.execute(
      """
      DELETE FROM mobile_phone_otps
      WHERE clinic_id = ? AND phone_e164 = ? AND verified_at IS NULL
      """,
      (clinic_id, phone_e164),
    )
    insert_and_get_id(
      conn,
      """
      INSERT INTO mobile_phone_otps (
        clinic_id,
        request_id,
        phone_e164,
        code_hash,
        attempt_count,
        max_attempts,
        expires_at,
        verified_at,
        delivery_status,
        delivery_error,
        provider_message_id
      )
      VALUES (?, ?, ?, ?, 0, ?, ?, NULL, 'pending', '', '')
      """,
      (clinic_id, request_id, phone_e164, code_hash, MOBILE_OTP_MAX_ATTEMPTS, expires_at),
    )

  minutes = max(1, int(round(MOBILE_OTP_TTL_SECONDS / 60)))
  sms_text = (
    f"{MOBILE_OTP_BRAND_NAME}: Dein Login-Code lautet {raw_code}. "
    f"Der Code ist {minutes} Minute{'n' if minutes != 1 else ''} gültig."
  )
  if MOBILE_OTP_DEBUG:
    # In lokaler Entwicklung nie auf Twilio warten, sonst laufen Mobile-Requests in Timeouts.
    delivery_status = "debug"
    delivery_error = "Debug-Modus aktiv."
    provider_message_id = ""
    used_debug_delivery = True
  else:
    delivery_result = send_sms_via_twilio(phone_e164, sms_text)
    delivery_status = str(delivery_result.get("status") or "").strip().lower() or "failed"
    delivery_error = str(delivery_result.get("error") or "").strip()
    provider_message_id = str(delivery_result.get("providerMessageId") or "").strip()
    used_debug_delivery = False

    if delivery_status != "sent":
      with get_db() as conn:
        conn.execute("DELETE FROM mobile_phone_otps WHERE request_id = ?", (request_id,))
      return (
        mobile_otp_error_payload(
          delivery_error or "OTP-SMS konnte nicht gesendet werden.",
          "OTP_DELIVERY_FAILED",
        ),
        503,
      )

  with get_db() as conn:
    conn.execute(
      """
      UPDATE mobile_phone_otps
      SET delivery_status = ?, delivery_error = ?, provider_message_id = ?
      WHERE request_id = ?
      """,
      (delivery_status, delivery_error, provider_message_id, request_id),
    )

  response_payload = {
    "success": True,
    "requestId": request_id,
    "maskedPhone": mask_phone_for_display(phone_e164),
    "expiresAt": expires_at,
    "ttlSeconds": MOBILE_OTP_TTL_SECONDS,
    "resendAfterSeconds": MOBILE_OTP_RESEND_COOLDOWN_SECONDS,
    "delivery": "debug" if used_debug_delivery else "sms",
  }
  if used_debug_delivery:
    response_payload["debugCode"] = raw_code
  return response_payload, 201


def mobile_member_email_for_phone(clinic_id: int, phone_e164: str) -> str:
  digits = re.sub(r"\D", "", phone_e164)
  fingerprint = hashlib.sha256(f"{clinic_id}:{digits}".encode("utf-8")).hexdigest()[:18]
  return f"p{clinic_id}_{fingerprint}@patient.appointmentix.local"


def mobile_member_name_for_phone(phone_e164: str) -> str:
  digits = re.sub(r"\D", "", phone_e164)
  if len(digits) >= 4:
    return f"Patient {digits[-4:]}"
  return "Patient"


def normalize_patient_membership_status(value: object, fallback: str = "inactive") -> str:
  status = str(value or "").strip().lower()
  if status in PATIENT_MEMBERSHIP_STATUSES:
    return status
  return fallback


def normalize_patient_payment_status(value: object, fallback: str = "pending") -> str:
  status = str(value or "").strip().lower()
  if status in PATIENT_PAYMENT_STATUSES:
    return status
  return fallback


def resolve_catalog_membership_plan(clinic_row, membership_id: str) -> dict | None:
  target_membership_id = str(membership_id or "").strip()
  if not target_membership_id:
    return None
  catalog = load_clinic_catalog_bundle(clinic_row)
  for membership in catalog.get("memberships") or []:
    if str(membership.get("id", "")).strip() == target_membership_id:
      return membership
  return None


def resolve_catalog_treatment(catalog: dict, treatment_id: str) -> dict | None:
  target_treatment_id = str(treatment_id or "").strip()
  if not target_treatment_id:
    return None
  for treatment in catalog.get("treatments") or []:
    if str(treatment.get("id", "")).strip() == target_treatment_id:
      return treatment
  return None


def resolve_membership_status_for_payment(payment_status: str, current_status: str) -> str:
  normalized_payment = normalize_patient_payment_status(payment_status, "pending")
  normalized_current = normalize_patient_membership_status(current_status, "inactive")

  if normalized_payment == "paid":
    return "active"
  if normalized_payment in {"failed", "past_due"}:
    return "past_due"
  if normalized_payment == "canceled":
    return "canceled"
  return normalized_current


def synchronize_patient_membership_row(clinic_row, membership_row):
  if not membership_row:
    return None

  clinic_id = int(clinic_row["id"])
  patient_email = sanitize_patient_email(membership_row["patient_email"])
  if not patient_email:
    return membership_row

  membership_id = str(membership_row["membership_id"] or "").strip()
  membership_plan = resolve_catalog_membership_plan(clinic_row, membership_id)
  target_membership_name = (
    str((membership_plan or {}).get("name") or membership_row["membership_name"] or membership_id or "Membership").strip()
  )
  target_amount_cents = parse_amount_cents((membership_plan or {}).get("priceCents"))
  if target_amount_cents is None:
    target_amount_cents = int(membership_row["monthly_amount_cents"] or 0)

  current_status = normalize_patient_membership_status(membership_row["status"], "inactive")
  current_payment_status = normalize_patient_payment_status(membership_row["last_payment_status"], "pending")
  target_status = current_status
  if current_status not in {"canceled", "inactive"}:
    target_status = resolve_membership_status_for_payment(current_payment_status, current_status)

  now_dt = utc_now()
  now_iso = now_dt.isoformat()
  current_period_end = membership_row["current_period_end"]
  next_charge_at = membership_row["next_charge_at"]
  canceled_at = membership_row["canceled_at"]

  if target_status in {"active", "past_due", "paused"}:
    if not current_period_end:
      current_period_end = (now_dt + timedelta(days=PATIENT_MEMBERSHIP_BILLING_DAYS)).isoformat()
    if not next_charge_at:
      next_charge_at = current_period_end
    canceled_at = None
  else:
    next_charge_at = None
    canceled_at = canceled_at or now_iso

  changes_detected = (
    str(membership_row["membership_name"] or "") != target_membership_name
    or int(membership_row["monthly_amount_cents"] or 0) != int(target_amount_cents or 0)
    or current_status != target_status
    or str(membership_row["current_period_end"] or "") != str(current_period_end or "")
    or str(membership_row["next_charge_at"] or "") != str(next_charge_at or "")
    or str(membership_row["canceled_at"] or "") != str(canceled_at or "")
  )
  if not changes_detected:
    return membership_row

  with get_db() as conn:
    conn.execute(
      """
      UPDATE patient_memberships
      SET
        membership_name = ?,
        monthly_amount_cents = ?,
        status = ?,
        current_period_end = ?,
        next_charge_at = ?,
        canceled_at = ?,
        updated_at = ?
      WHERE id = ?
      """,
      (
        target_membership_name,
        int(target_amount_cents or 0),
        target_status,
        current_period_end,
        next_charge_at,
        canceled_at,
        now_iso,
        membership_row["id"],
      ),
    )

  return get_patient_membership_row(clinic_id, patient_email)


def membership_pricing_for_treatment(
  clinic_row,
  treatment: dict,
  membership_row,
):
  treatment_id = str(treatment.get("id") or "").strip()
  standard_price_cents = parse_amount_cents(treatment.get("priceCents")) or 0
  member_price_cents = parse_amount_cents(treatment.get("memberPriceCents"))
  if member_price_cents is None:
    member_price_cents = standard_price_cents

  membership_status = "inactive"
  membership_id = ""
  included_ids: set[str] = set()

  if membership_row:
    membership_status = normalize_patient_membership_status(membership_row["status"], "inactive")
    membership_id = str(membership_row["membership_id"] or "").strip()
    membership_plan = resolve_catalog_membership_plan(clinic_row, membership_id)
    if membership_plan:
      included_ids = {
        str(value or "").strip()
        for value in (membership_plan.get("includedTreatmentIds") or [])
        if str(value or "").strip()
      }

  unit_price_cents = standard_price_cents
  price_source = "standard"
  if membership_status == "active":
    if treatment_id and treatment_id in included_ids:
      unit_price_cents = 0
      price_source = "included"
    else:
      unit_price_cents = member_price_cents
      price_source = "member"

  return {
    "treatmentId": treatment_id,
    "unitPriceCents": int(unit_price_cents),
    "standardPriceCents": int(standard_price_cents),
    "memberPriceCents": int(member_price_cents),
    "priceSource": price_source,
    "membershipStatus": membership_status,
    "membershipId": membership_id,
  }


def serialize_patient_membership_row(row) -> dict:
  return {
    "id": row["id"],
    "clinicId": row["clinic_id"],
    "patientEmail": row["patient_email"],
    "patientName": row["patient_name"],
    "membershipId": row["membership_id"],
    "membershipName": row["membership_name"],
    "monthlyAmountCents": int(row["monthly_amount_cents"] or 0),
    "currency": row["currency"] or "eur",
    "status": row["status"] or "inactive",
    "startedAt": row["started_at"],
    "currentPeriodEnd": row["current_period_end"],
    "nextChargeAt": row["next_charge_at"],
    "canceledAt": row["canceled_at"],
    "lastPaymentStatus": row["last_payment_status"] or "pending",
    "createdAt": row["created_at"],
    "updatedAt": row["updated_at"],
  }


def get_patient_membership_row(clinic_id: int, patient_email: str):
  safe_email = sanitize_patient_email(patient_email)
  if not safe_email:
    return None
  with get_db() as conn:
    row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        patient_email,
        patient_name,
        membership_id,
        membership_name,
        monthly_amount_cents,
        currency,
        status,
        started_at,
        current_period_end,
        next_charge_at,
        canceled_at,
        last_payment_status,
        created_at,
        updated_at
      FROM patient_memberships
      WHERE clinic_id = ? AND patient_email = ?
      LIMIT 1
      """,
      (clinic_id, safe_email),
    ).fetchone()
  return row


def activate_patient_membership(
  clinic_row,
  patient_email: str,
  patient_name: str,
  membership_plan: dict,
  payment_status: str = "paid",
):
  clinic_id = int(clinic_row["id"])
  safe_email = sanitize_patient_email(patient_email)
  if not safe_email:
    return None

  raw_name = sanitize_patient_name(patient_name)
  safe_name = raw_name or safe_email.split("@")[0]

  membership_id = str(membership_plan.get("id") or "").strip()
  membership_name = str(membership_plan.get("name") or membership_id or "Membership").strip()
  monthly_amount_cents = parse_amount_cents(membership_plan.get("priceCents")) or 0

  now_dt = utc_now()
  now_iso = now_dt.isoformat()
  next_charge_iso = (now_dt + timedelta(days=PATIENT_MEMBERSHIP_BILLING_DAYS)).isoformat()
  normalized_payment = normalize_patient_payment_status(payment_status, "paid")
  normalized_status = resolve_membership_status_for_payment(normalized_payment, "active")
  next_charge_value = next_charge_iso if normalized_status in {"active", "past_due", "paused"} else None
  current_period_end_value = next_charge_iso if normalized_status in {"active", "past_due", "paused"} else None
  canceled_at_value = now_iso if normalized_status in {"canceled", "inactive"} else None

  with get_db() as conn:
    existing = conn.execute(
      """
      SELECT id, started_at
      FROM patient_memberships
      WHERE clinic_id = ? AND patient_email = ?
      LIMIT 1
      """,
      (clinic_id, safe_email),
    ).fetchone()

    if existing:
      started_at = str(existing["started_at"] or now_iso)
      conn.execute(
        """
        UPDATE patient_memberships
        SET
          patient_name = ?,
          membership_id = ?,
          membership_name = ?,
          monthly_amount_cents = ?,
          currency = 'eur',
          status = ?,
          started_at = ?,
          current_period_end = ?,
          next_charge_at = ?,
          canceled_at = ?,
          last_payment_status = ?,
          updated_at = ?
        WHERE id = ?
        """,
        (
          safe_name,
          membership_id,
          membership_name,
          monthly_amount_cents,
          normalized_status,
          started_at,
          current_period_end_value,
          next_charge_value,
          canceled_at_value,
          normalized_payment,
          now_iso,
          existing["id"],
        ),
      )
    else:
      conn.execute(
        """
        INSERT INTO patient_memberships (
          clinic_id,
          patient_email,
          patient_name,
          membership_id,
          membership_name,
          monthly_amount_cents,
          currency,
          status,
          started_at,
          current_period_end,
          next_charge_at,
          canceled_at,
          last_payment_status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'eur', ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
          clinic_id,
          safe_email,
          safe_name,
          membership_id,
          membership_name,
          monthly_amount_cents,
          normalized_status,
          now_iso,
          current_period_end_value,
          next_charge_value,
          canceled_at_value,
          normalized_payment,
          now_iso,
          now_iso,
        ),
      )

    row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        patient_email,
        patient_name,
        membership_id,
        membership_name,
        monthly_amount_cents,
        currency,
        status,
        started_at,
        current_period_end,
        next_charge_at,
        canceled_at,
        last_payment_status,
        created_at,
        updated_at
      FROM patient_memberships
      WHERE clinic_id = ? AND patient_email = ?
      LIMIT 1
      """,
      (clinic_id, safe_email),
    ).fetchone()
  return row


def update_patient_membership_status(
  clinic_id: int,
  patient_email: str,
  status: str,
  payment_status: str | None = None,
):
  safe_email = sanitize_patient_email(patient_email)
  if not safe_email:
    return None

  normalized_status = normalize_patient_membership_status(status, "inactive")
  normalized_payment = (
    normalize_patient_payment_status(payment_status, "pending")
    if payment_status is not None
    else None
  )

  now_dt = utc_now()
  now_iso = now_dt.isoformat()

  with get_db() as conn:
    existing = conn.execute(
      """
      SELECT
        id,
        current_period_end,
        next_charge_at,
        last_payment_status
      FROM patient_memberships
      WHERE clinic_id = ? AND patient_email = ?
      LIMIT 1
      """,
      (clinic_id, safe_email),
    ).fetchone()
    if not existing:
      return None

    current_period_end = existing["current_period_end"]
    next_charge_at = existing["next_charge_at"]

    if normalized_status == "active":
      if not current_period_end:
        current_period_end = (now_dt + timedelta(days=PATIENT_MEMBERSHIP_BILLING_DAYS)).isoformat()
      if not next_charge_at:
        next_charge_at = current_period_end
    elif normalized_status in {"canceled", "inactive"}:
      next_charge_at = None

    conn.execute(
      """
      UPDATE patient_memberships
      SET
        status = ?,
        current_period_end = ?,
        next_charge_at = ?,
        canceled_at = CASE
          WHEN ? IN ('canceled', 'inactive') THEN ?
          ELSE NULL
        END,
        last_payment_status = ?,
        updated_at = ?
      WHERE id = ?
      """,
      (
        normalized_status,
        current_period_end,
        next_charge_at,
        normalized_status,
        now_iso,
        normalized_payment or existing["last_payment_status"] or "pending",
        now_iso,
        existing["id"],
      ),
    )

    row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        patient_email,
        patient_name,
        membership_id,
        membership_name,
        monthly_amount_cents,
        currency,
        status,
        started_at,
        current_period_end,
        next_charge_at,
        canceled_at,
        last_payment_status,
        created_at,
        updated_at
      FROM patient_memberships
      WHERE id = ?
      LIMIT 1
      """,
      (existing["id"],),
    ).fetchone()
  return row


def list_patient_memberships_by_clinic(clinic_id: int, limit: int = 200) -> list:
  safe_limit = max(1, min(limit, 300))
  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        patient_email,
        patient_name,
        membership_id,
        membership_name,
        monthly_amount_cents,
        currency,
        status,
        started_at,
        current_period_end,
        next_charge_at,
        canceled_at,
        last_payment_status,
        created_at,
        updated_at
      FROM patient_memberships
      WHERE clinic_id = ?
      ORDER BY updated_at DESC, id DESC
      LIMIT ?
      """,
      (clinic_id, safe_limit),
    ).fetchall()
  return list(rows)


def summarize_patient_memberships(rows: list) -> dict:
  summary = {
    "total": 0,
    "active": 0,
    "pastDue": 0,
    "paused": 0,
    "canceled": 0,
    "inactive": 0,
    "mrrCents": 0,
    "plans": [],
  }
  plan_counts: dict[str, int] = {}

  for row in rows:
    summary["total"] += 1
    status = normalize_patient_membership_status(row["status"], "inactive")
    if status == "active":
      summary["active"] += 1
      summary["mrrCents"] += int(row["monthly_amount_cents"] or 0)
      plan_name = str(row["membership_name"] or row["membership_id"] or "Membership")
      plan_counts[plan_name] = plan_counts.get(plan_name, 0) + 1
    elif status == "past_due":
      summary["pastDue"] += 1
    elif status == "paused":
      summary["paused"] += 1
    elif status == "canceled":
      summary["canceled"] += 1
    else:
      summary["inactive"] += 1

  summary["plans"] = [
    {"name": name, "activeCount": count}
    for name, count in sorted(plan_counts.items(), key=lambda item: item[1], reverse=True)
  ]
  return summary


def serialize_event_metadata(raw_metadata: object) -> str:
  if isinstance(raw_metadata, dict):
    candidate = raw_metadata
  else:
    candidate = {}
  try:
    return json.dumps(candidate, ensure_ascii=False, separators=(",", ":"))
  except Exception:
    return "{}"


def parse_event_metadata(raw_text: object) -> dict:
  if not raw_text:
    return {}
  try:
    parsed = json.loads(str(raw_text))
  except Exception:
    return {}
  if isinstance(parsed, dict):
    return parsed
  return {}


def normalize_campaign_trigger(value: object, fallback: str = "broadcast") -> str:
  trigger = str(value or "").strip().lower()
  if trigger in CAMPAIGN_TRIGGER_CHOICES:
    return trigger
  return fallback


def normalize_campaign_channel(value: object, fallback: str = "in_app") -> str:
  channel = str(value or "").strip().lower()
  if channel in CAMPAIGN_CHANNEL_CHOICES:
    return channel
  return fallback


def normalize_campaign_status(value: object, fallback: str = "draft") -> str:
  status = str(value or "").strip().lower()
  if status in CAMPAIGN_STATUS_CHOICES:
    return status
  return fallback


def sanitize_campaign_text(value: object, max_length: int = 1000) -> str:
  text = str(value or "").strip()
  if len(text) > max_length:
    return text[:max_length]
  return text


def serialize_campaign_row(row) -> dict:
  return {
    "id": row["id"],
    "clinicId": row["clinic_id"],
    "name": row["name"],
    "triggerType": row["trigger_type"],
    "channel": row["channel"],
    "status": row["status"],
    "templateTitle": row["template_title"],
    "templateBody": row["template_body"],
    "pointsBonus": int(row["points_bonus"] or 0),
    "lastRunAt": row["last_run_at"],
    "nextRunAt": row["next_run_at"],
    "totalRuns": int(row["total_runs"] or 0),
    "totalAudience": int(row["total_audience"] or 0),
    "createdByUserId": row["created_by_user_id"],
    "createdAt": row["created_at"],
    "updatedAt": row["updated_at"],
  }


def extract_event_actor_key(metadata: dict) -> str:
  for key in ("patientId", "memberEmail", "email", "sessionId"):
    value = str(metadata.get(key) or "").strip().lower()
    if value:
      return value
  return ""


def estimate_campaign_audience(clinic_id: int, trigger_type: str) -> int:
  normalized_trigger = normalize_campaign_trigger(trigger_type, "broadcast")

  with get_db() as conn:
    if normalized_trigger == "membership_past_due":
      row = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM patient_memberships
        WHERE clinic_id = ? AND status = 'past_due'
        """,
        (clinic_id,),
      ).fetchone()
      return int(row["count"] or 0)

    if normalized_trigger == "membership_canceled_winback":
      row = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM patient_memberships
        WHERE clinic_id = ? AND status = 'canceled'
        """,
        (clinic_id,),
      ).fetchone()
      return int(row["count"] or 0)

    if normalized_trigger == "inactive_30d":
      rows = conn.execute(
        """
        SELECT event_name, metadata_json, created_at
        FROM analytics_events
        WHERE clinic_id = ?
        ORDER BY created_at DESC
        LIMIT 8000
        """,
        (clinic_id,),
      ).fetchall()

      threshold = utc_now() - timedelta(days=30)
      latest_open_by_key: dict[str, datetime] = {}
      keys_seen: set[str] = set()
      for row in rows:
        metadata = parse_event_metadata(row["metadata_json"])
        actor_key = extract_event_actor_key(metadata)
        if not actor_key:
          continue
        keys_seen.add(actor_key)
        if str(row["event_name"] or "").lower() != "app_open":
          continue
        parsed_created = parse_datetime_utc(row["created_at"])
        if parsed_created is None:
          continue
        existing = latest_open_by_key.get(actor_key)
        if existing is None or parsed_created > existing:
          latest_open_by_key[actor_key] = parsed_created

      inactive = 0
      for actor_key in keys_seen:
        last_open = latest_open_by_key.get(actor_key)
        if last_open is None or last_open < threshold:
          inactive += 1
      return inactive

    if normalized_trigger == "abandoned_cart_24h":
      since = (utc_now() - timedelta(hours=24)).isoformat()
      rows = conn.execute(
        """
        SELECT event_name, metadata_json
        FROM analytics_events
        WHERE clinic_id = ? AND created_at >= ?
        """,
        (clinic_id, since),
      ).fetchall()

      cart_keys = set()
      purchase_keys = set()
      for row in rows:
        metadata = parse_event_metadata(row["metadata_json"])
        actor_key = extract_event_actor_key(metadata)
        if not actor_key:
          continue
        event_name = str(row["event_name"] or "").lower()
        if event_name == "add_to_cart":
          cart_keys.add(actor_key)
        elif event_name == "purchase_success":
          purchase_keys.add(actor_key)
      return max(0, len(cart_keys - purchase_keys))

    active_row = conn.execute(
      """
      SELECT COUNT(*) AS count
      FROM patient_memberships
      WHERE clinic_id = ? AND status = 'active'
      """,
      (clinic_id,),
    ).fetchone()
    active_memberships = int(active_row["count"] or 0)

    known_keys_row = conn.execute(
      """
      SELECT COUNT(*) AS count
      FROM analytics_events
      WHERE clinic_id = ?
      """,
      (clinic_id,),
    ).fetchone()
    known_events = int(known_keys_row["count"] or 0)
    if active_memberships > 0:
      return active_memberships
    return 1 if known_events > 0 else 0


def sanitize_audit_text(value: object, fallback: str, max_length: int = 80) -> str:
  text = str(value or "").strip()
  if not text:
    text = fallback
  if len(text) > max_length:
    return text[:max_length]
  return text


def create_audit_log(
  clinic_id: int,
  actor_user_id: int | None,
  action: str,
  entity_type: str,
  entity_id: str = "",
  metadata: dict | None = None,
) -> int:
  safe_action = sanitize_audit_text(action, "unknown_action", 80)
  safe_entity_type = sanitize_audit_text(entity_type, "general", 80)
  safe_entity_id = sanitize_campaign_text(entity_id, 180)

  with get_db() as conn:
    log_id = insert_and_get_id(
      conn,
      """
      INSERT INTO audit_logs (
        clinic_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        metadata_json
      )
      VALUES (?, ?, ?, ?, ?, ?)
      """,
      (
        clinic_id,
        actor_user_id,
        safe_action,
        safe_entity_type,
        safe_entity_id,
        serialize_event_metadata(metadata or {}),
      ),
    )
  return log_id


def list_clinic_audit_logs(clinic_id: int, limit: int = 100) -> list[dict]:
  safe_limit = max(1, min(int(limit), 300))
  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        l.id,
        l.clinic_id,
        l.actor_user_id,
        l.action,
        l.entity_type,
        l.entity_id,
        l.metadata_json,
        l.created_at,
        u.full_name AS actor_name,
        u.email AS actor_email
      FROM audit_logs l
      LEFT JOIN users u ON u.id = l.actor_user_id
      WHERE l.clinic_id = ?
      ORDER BY l.id DESC
      LIMIT ?
      """,
      (clinic_id, safe_limit),
    ).fetchall()

  output = []
  for row in rows:
    output.append(
      {
        "id": row["id"],
        "clinicId": row["clinic_id"],
        "actorUserId": row["actor_user_id"],
        "actorName": row["actor_name"],
        "actorEmail": row["actor_email"],
        "action": row["action"],
        "entityType": row["entity_type"],
        "entityId": row["entity_id"],
        "metadata": parse_event_metadata(row["metadata_json"]),
        "createdAt": row["created_at"],
      }
    )
  return output


def extract_email_from_metadata(metadata: dict) -> str:
  candidates = [
    metadata.get("memberEmail"),
    metadata.get("email"),
    metadata.get("patientEmail"),
  ]
  for candidate in candidates:
    normalized = sanitize_patient_email(candidate)
    if normalized:
      return normalized
  return ""


def extract_phone_from_metadata(metadata: dict) -> str:
  candidates = [
    metadata.get("phone"),
    metadata.get("memberPhone"),
    metadata.get("patientPhone"),
  ]
  for candidate in candidates:
    phone = str(candidate or "").strip()
    if len(phone) >= 8:
      return phone
  return ""


def extract_external_user_id_from_metadata(metadata: dict) -> str:
  candidates = [
    metadata.get("patientId"),
    metadata.get("externalUserId"),
    metadata.get("sessionId"),
    metadata.get("memberEmail"),
    metadata.get("email"),
  ]
  for candidate in candidates:
    value = str(candidate or "").strip()
    if value:
      return value[:120]
  return ""


def collect_clinic_recipient_profiles(clinic_id: int) -> list[dict]:
  with get_db() as conn:
    membership_rows = conn.execute(
      """
      SELECT
        patient_email,
        patient_name,
        status,
        last_payment_status
      FROM patient_memberships
      WHERE clinic_id = ?
      """,
      (clinic_id,),
    ).fetchall()
    event_rows = conn.execute(
      """
      SELECT
        event_name,
        metadata_json,
        created_at
      FROM analytics_events
      WHERE clinic_id = ?
      ORDER BY created_at DESC
      LIMIT 10000
      """,
      (clinic_id,),
    ).fetchall()

  profiles: dict[str, dict] = {}

  for row in membership_rows:
    email = sanitize_patient_email(row["patient_email"])
    if not email:
      continue
    profile = profiles.setdefault(
      email,
      {
        "key": email,
        "email": email,
        "name": sanitize_patient_name(row["patient_name"]) or email.split("@")[0],
        "phone": "",
        "externalUserId": email,
        "membershipStatus": normalize_patient_membership_status(row["status"], "inactive"),
        "lastPaymentStatus": normalize_patient_payment_status(row["last_payment_status"], "pending"),
        "lastAppOpenAt": None,
        "lastAddToCartAt": None,
        "lastPurchaseAt": None,
        "lastSeenAt": None,
      },
    )
    profile["membershipStatus"] = normalize_patient_membership_status(row["status"], profile["membershipStatus"])
    profile["lastPaymentStatus"] = normalize_patient_payment_status(row["last_payment_status"], profile["lastPaymentStatus"])

  for row in event_rows:
    metadata = parse_event_metadata(row["metadata_json"])
    email = extract_email_from_metadata(metadata)
    actor_key = email or extract_event_actor_key(metadata)
    if not actor_key:
      continue

    parsed_created = parse_datetime_utc(row["created_at"])
    event_name = str(row["event_name"] or "").lower()

    if email:
      key = email
    else:
      key = f"id:{actor_key.lower()}"

    profile = profiles.setdefault(
      key,
      {
        "key": key,
        "email": email,
        "name": sanitize_patient_name(metadata.get("memberName") or metadata.get("name")) or (email.split("@")[0] if email else actor_key[:20]),
        "phone": extract_phone_from_metadata(metadata),
        "externalUserId": extract_external_user_id_from_metadata(metadata) or actor_key,
        "membershipStatus": "inactive",
        "lastPaymentStatus": "pending",
        "lastAppOpenAt": None,
        "lastAddToCartAt": None,
        "lastPurchaseAt": None,
        "lastSeenAt": None,
      },
    )

    if email and not profile.get("email"):
      profile["email"] = email
      profile["key"] = email
    if not profile.get("phone"):
      phone = extract_phone_from_metadata(metadata)
      if phone:
        profile["phone"] = phone
    if not profile.get("externalUserId"):
      external_id = extract_external_user_id_from_metadata(metadata)
      if external_id:
        profile["externalUserId"] = external_id
    if not profile.get("name"):
      profile["name"] = sanitize_patient_name(metadata.get("memberName") or metadata.get("name")) or (email.split("@")[0] if email else actor_key[:20])

    if parsed_created:
      existing_seen = parse_datetime_utc(profile.get("lastSeenAt"))
      if existing_seen is None or parsed_created > existing_seen:
        profile["lastSeenAt"] = parsed_created.isoformat()

      if event_name == "app_open":
        existing = parse_datetime_utc(profile.get("lastAppOpenAt"))
        if existing is None or parsed_created > existing:
          profile["lastAppOpenAt"] = parsed_created.isoformat()
      elif event_name == "add_to_cart":
        existing = parse_datetime_utc(profile.get("lastAddToCartAt"))
        if existing is None or parsed_created > existing:
          profile["lastAddToCartAt"] = parsed_created.isoformat()
      elif event_name == "purchase_success":
        existing = parse_datetime_utc(profile.get("lastPurchaseAt"))
        if existing is None or parsed_created > existing:
          profile["lastPurchaseAt"] = parsed_created.isoformat()

  return list(profiles.values())


def resolve_campaign_recipients(clinic_id: int, trigger_type: str) -> list[dict]:
  profiles = collect_clinic_recipient_profiles(clinic_id)
  normalized_trigger = normalize_campaign_trigger(trigger_type, "broadcast")
  now_dt = utc_now()

  if normalized_trigger == "membership_past_due":
    return [profile for profile in profiles if profile.get("membershipStatus") == "past_due"]

  if normalized_trigger == "membership_canceled_winback":
    return [profile for profile in profiles if profile.get("membershipStatus") == "canceled"]

  if normalized_trigger == "inactive_30d":
    threshold = now_dt - timedelta(days=30)
    output = []
    for profile in profiles:
      last_app_open = parse_datetime_utc(profile.get("lastAppOpenAt"))
      if last_app_open is None or last_app_open < threshold:
        output.append(profile)
    return output

  if normalized_trigger == "abandoned_cart_24h":
    threshold = now_dt - timedelta(hours=24)
    output = []
    for profile in profiles:
      last_cart = parse_datetime_utc(profile.get("lastAddToCartAt"))
      last_purchase = parse_datetime_utc(profile.get("lastPurchaseAt"))
      if last_cart is None or last_cart < threshold:
        continue
      if last_purchase is None or last_purchase < last_cart:
        output.append(profile)
    return output

  return profiles


def render_campaign_text(template_text: str, profile: dict, clinic_name: str) -> str:
  rendered = str(template_text or "")
  replacements = {
    "{{name}}": str(profile.get("name") or "Patient"),
    "{{email}}": str(profile.get("email") or ""),
    "{{clinic}}": str(clinic_name or "deine Klinik"),
    "{{membership_status}}": str(profile.get("membershipStatus") or "inactive"),
  }
  for key, value in replacements.items():
    rendered = rendered.replace(key, value)
  return rendered


def resend_configured() -> bool:
  return bool(RESEND_API_KEY) and bool(RESEND_FROM_EMAIL) and "@" in RESEND_FROM_EMAIL


def twilio_configured() -> bool:
  return bool(TWILIO_ACCOUNT_SID) and bool(TWILIO_AUTH_TOKEN) and bool(TWILIO_FROM_NUMBER)


def onesignal_configured() -> bool:
  return bool(ONESIGNAL_APP_ID) and bool(ONESIGNAL_REST_API_KEY)


def send_email_via_resend(to_email: str, subject: str, body_text: str) -> dict:
  if not resend_configured():
    return {"status": "skipped", "error": "RESEND nicht konfiguriert", "providerMessageId": ""}
  payload = {
    "from": RESEND_FROM_EMAIL,
    "to": [to_email],
    "subject": subject or "Update von Appointmentix",
    "html": f"<p>{body_text}</p>",
  }
  try:
    response = requests.post(
      "https://api.resend.com/emails",
      headers={
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
      },
      json=payload,
      timeout=12,
    )
    response_text = response.text
    parsed = {}
    if response_text:
      try:
        parsed = json.loads(response_text)
      except Exception:
        parsed = {}
    if response.status_code >= 400:
      return {
        "status": "failed",
        "error": parsed.get("message") or f"RESEND HTTP {response.status_code}",
        "providerMessageId": "",
      }
    return {
      "status": "sent",
      "error": "",
      "providerMessageId": str(parsed.get("id") or ""),
    }
  except Exception as exc:
    return {"status": "failed", "error": str(exc), "providerMessageId": ""}


def send_sms_via_twilio(to_phone: str, body_text: str) -> dict:
  if not twilio_configured():
    return {"status": "skipped", "error": "Twilio nicht konfiguriert", "providerMessageId": ""}
  if len(to_phone) < 8:
    return {"status": "skipped", "error": "Keine Telefonnummer vorhanden", "providerMessageId": ""}

  endpoint = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
  try:
    response = requests.post(
      endpoint,
      auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
      data={
        "To": to_phone,
        "From": TWILIO_FROM_NUMBER,
        "Body": body_text,
      },
      timeout=12,
    )
    response_text = response.text
    parsed = {}
    if response_text:
      try:
        parsed = json.loads(response_text)
      except Exception:
        parsed = {}
    if response.status_code >= 400:
      return {
        "status": "failed",
        "error": parsed.get("message") or f"Twilio HTTP {response.status_code}",
        "providerMessageId": "",
      }
    return {
      "status": "sent",
      "error": "",
      "providerMessageId": str(parsed.get("sid") or ""),
    }
  except Exception as exc:
    return {"status": "failed", "error": str(exc), "providerMessageId": ""}


def send_push_via_onesignal(external_user_id: str, title: str, body_text: str) -> dict:
  if not onesignal_configured():
    return {"status": "skipped", "error": "OneSignal nicht konfiguriert", "providerMessageId": ""}
  if not external_user_id:
    return {"status": "skipped", "error": "Keine Push-ID vorhanden", "providerMessageId": ""}

  payload = {
    "app_id": ONESIGNAL_APP_ID,
    "include_aliases": {"external_id": [external_user_id]},
    "target_channel": "push",
    "headings": {"en": title or "Appointmentix"},
    "contents": {"en": body_text},
  }
  try:
    response = requests.post(
      "https://api.onesignal.com/notifications?c=push",
      headers={
        "Authorization": f"Key {ONESIGNAL_REST_API_KEY}",
        "Content-Type": "application/json",
      },
      json=payload,
      timeout=12,
    )
    response_text = response.text
    parsed = {}
    if response_text:
      try:
        parsed = json.loads(response_text)
      except Exception:
        parsed = {}
    if response.status_code >= 400:
      return {
        "status": "failed",
        "error": parsed.get("errors") or f"OneSignal HTTP {response.status_code}",
        "providerMessageId": "",
      }
    return {
      "status": "sent",
      "error": "",
      "providerMessageId": str(parsed.get("id") or ""),
    }
  except Exception as exc:
    return {"status": "failed", "error": str(exc), "providerMessageId": ""}


def insert_campaign_delivery(
  clinic_id: int,
  campaign_id: int,
  recipient_key: str,
  channel: str,
  status: str,
  provider_message_id: str = "",
  error_message: str = "",
  metadata: dict | None = None,
) -> int:
  with get_db() as conn:
    return insert_and_get_id(
      conn,
      """
      INSERT INTO campaign_deliveries (
        clinic_id,
        campaign_id,
        recipient_key,
        channel,
        status,
        provider_message_id,
        error_message,
        metadata_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        clinic_id,
        campaign_id,
        sanitize_campaign_text(recipient_key, 180) or "unknown",
        normalize_campaign_channel(channel, "in_app"),
        sanitize_campaign_text(status, 40) or "unknown",
        sanitize_campaign_text(provider_message_id, 180),
        sanitize_campaign_text(error_message, 500),
        serialize_event_metadata(metadata or {}),
      ),
    )


def deliver_campaign_message(clinic_name: str, channel: str, title: str, body: str, profile: dict) -> dict:
  normalized_channel = normalize_campaign_channel(channel, "in_app")
  recipient_key = str(profile.get("key") or profile.get("email") or profile.get("externalUserId") or "")

  if normalized_channel == "in_app":
    return {
      "status": "sent",
      "error": "",
      "providerMessageId": "",
      "recipientKey": recipient_key,
    }

  if normalized_channel == "email":
    email = sanitize_patient_email(profile.get("email"))
    if not email:
      return {"status": "skipped", "error": "Keine E-Mail vorhanden", "providerMessageId": "", "recipientKey": recipient_key}
    result = send_email_via_resend(email, title, body)
    return {**result, "recipientKey": email}

  if normalized_channel == "sms":
    phone = str(profile.get("phone") or "").strip()
    result = send_sms_via_twilio(phone, body)
    return {**result, "recipientKey": recipient_key or phone}

  if normalized_channel == "push":
    external_id = str(profile.get("externalUserId") or "").strip()
    result = send_push_via_onesignal(external_id, title, body)
    return {**result, "recipientKey": recipient_key or external_id}

  return {"status": "skipped", "error": "Unbekannter Kanal", "providerMessageId": "", "recipientKey": recipient_key}


def execute_campaign_delivery(
  clinic_row,
  campaign_row,
  trigger_override: str | None = None,
) -> dict:
  clinic_id = int(clinic_row["id"])
  campaign_id = int(campaign_row["id"])
  clinic_name = str(clinic_row["name"])

  trigger_type = normalize_campaign_trigger(trigger_override or campaign_row["trigger_type"], "broadcast")
  channel = normalize_campaign_channel(campaign_row["channel"], "in_app")
  template_title = sanitize_campaign_text(campaign_row["template_title"], 180)
  template_body = sanitize_campaign_text(campaign_row["template_body"], 3000)
  points_bonus = int(campaign_row["points_bonus"] or 0)

  recipients = resolve_campaign_recipients(clinic_id, trigger_type)
  summary = {
    "attempted": 0,
    "sent": 0,
    "failed": 0,
    "skipped": 0,
  }

  for profile in recipients:
    rendered_title = render_campaign_text(template_title or "Update von {{clinic}}", profile, clinic_name)
    rendered_body = render_campaign_text(template_body or "Wir haben ein neues Angebot für dich.", profile, clinic_name)
    result = deliver_campaign_message(clinic_name, channel, rendered_title, rendered_body, profile)

    status = str(result.get("status") or "skipped")
    if status not in {"sent", "failed", "skipped"}:
      status = "skipped"

    summary["attempted"] += 1
    summary[status] += 1

    recipient_key = str(result.get("recipientKey") or profile.get("key") or profile.get("email") or "unknown")
    provider_message_id = str(result.get("providerMessageId") or "")
    error_message = str(result.get("error") or "")

    insert_campaign_delivery(
      clinic_id=clinic_id,
      campaign_id=campaign_id,
      recipient_key=recipient_key,
      channel=channel,
      status=status,
      provider_message_id=provider_message_id,
      error_message=error_message,
      metadata={
        "triggerType": trigger_type,
        "channel": channel,
        "email": profile.get("email") or "",
        "externalUserId": profile.get("externalUserId") or "",
        "pointsBonus": points_bonus,
      },
    )

  return {
    **summary,
    "triggerType": trigger_type,
    "channel": channel,
    "pointsBonus": points_bonus,
  }


def compute_campaign_next_run_iso(trigger_type: str, reference_time: datetime | None = None) -> str | None:
  normalized = normalize_campaign_trigger(trigger_type, "broadcast")
  if normalized == "broadcast":
    return None

  now_time = reference_time or utc_now()
  if normalized == "abandoned_cart_24h":
    return (now_time + timedelta(days=1)).isoformat()
  return (now_time + timedelta(days=7)).isoformat()


def load_campaign_row_by_id(clinic_id: int, campaign_id: int):
  with get_db() as conn:
    return conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE id = ? AND clinic_id = ?
      LIMIT 1
      """,
      (campaign_id, clinic_id),
    ).fetchone()


def run_campaign_once(campaign_row, actor_user_id: int | None, event_source: str) -> dict:
  clinic_id = int(campaign_row["clinic_id"])
  campaign_id = int(campaign_row["id"])
  trigger_type = normalize_campaign_trigger(campaign_row["trigger_type"], "broadcast")
  now_dt = utc_now()
  now_iso = now_dt.isoformat()
  next_run_iso = compute_campaign_next_run_iso(trigger_type, now_dt)

  delivery = execute_campaign_delivery(
    clinic_row=get_clinic_row_by_id(clinic_id) or {"id": clinic_id, "name": ""},
    campaign_row=campaign_row,
    trigger_override=trigger_type,
  )
  audience_count = int(delivery.get("attempted") or 0)

  with get_db() as conn:
    conn.execute(
      """
      UPDATE clinic_campaigns
      SET
        status = CASE WHEN status = 'draft' THEN 'active' ELSE status END,
        last_run_at = ?,
        next_run_at = ?,
        total_runs = total_runs + 1,
        total_audience = total_audience + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND clinic_id = ?
      """,
      (now_iso, next_run_iso, audience_count, campaign_id, clinic_id),
    )

  updated_row = load_campaign_row_by_id(clinic_id, campaign_id)

  create_analytics_event(
    clinic_id=clinic_id,
    user_id=actor_user_id,
    event_name="campaign_run",
    treatment_id=str(campaign_id),
    amount_cents=None,
    metadata={
      "campaignId": campaign_id,
      "triggerType": trigger_type,
      "channel": str(campaign_row["channel"]),
      "attempted": int(delivery.get("attempted") or 0),
      "sent": int(delivery.get("sent") or 0),
      "failed": int(delivery.get("failed") or 0),
      "skipped": int(delivery.get("skipped") or 0),
    },
    event_source=event_source,
  )
  if int(delivery.get("sent") or 0) > 0:
    create_analytics_event(
      clinic_id=clinic_id,
      user_id=actor_user_id,
      event_name="campaign_delivery",
      treatment_id=str(campaign_id),
      amount_cents=None,
      metadata={
        "campaignId": campaign_id,
        "sent": int(delivery.get("sent") or 0),
        "failed": int(delivery.get("failed") or 0),
        "skipped": int(delivery.get("skipped") or 0),
        "channel": str(campaign_row["channel"]),
      },
      event_source=event_source,
    )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=actor_user_id,
    action="campaign.run",
    entity_type="campaign",
    entity_id=str(campaign_id),
    metadata={
      "triggerType": trigger_type,
      "audienceCount": audience_count,
      "channel": str(campaign_row["channel"]),
      "pointsBonus": int(campaign_row["points_bonus"] or 0),
      "delivery": delivery,
    },
  )

  return {
    "campaign": serialize_campaign_row(updated_row) if updated_row else serialize_campaign_row(campaign_row),
    "run": {
      "executedAt": now_iso,
      "audienceCount": audience_count,
      "delivery": delivery,
    },
  }


def normalize_event_name(value: object) -> str:
  event_name = str(value or "").strip().lower()
  if event_name in ANALYTICS_EVENT_NAMES:
    return event_name
  return ""


def sanitize_treatment_id(value: object) -> str:
  treatment_id = str(value or "").strip()
  if not treatment_id:
    return ""
  if len(treatment_id) > 100:
    return treatment_id[:100]
  return treatment_id


def parse_amount_cents(value: object) -> int | None:
  if value is None or value == "":
    return None
  try:
    parsed = int(value)
  except (TypeError, ValueError):
    return None
  if parsed < 0:
    return None
  return parsed


def create_analytics_event(
  clinic_id: int,
  user_id: int | None,
  event_name: str,
  treatment_id: str | None = None,
  amount_cents: int | None = None,
  metadata: dict | None = None,
  event_source: str = "unknown",
) -> int:
  with get_db() as conn:
    event_id = insert_and_get_id(
      conn,
      """
      INSERT INTO analytics_events (
        clinic_id,
        user_id,
        event_name,
        treatment_id,
        amount_cents,
        metadata_json,
        event_source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """,
      (
        clinic_id,
        user_id,
        event_name,
        treatment_id or None,
        amount_cents,
        serialize_event_metadata(metadata),
        event_source,
      ),
    )
  return event_id


def parse_non_negative_int(value: object, fallback: int = 0) -> int:
  try:
    parsed = int(value)
  except (TypeError, ValueError):
    return fallback
  if parsed < 0:
    return fallback
  return parsed


def parse_analytics_days(raw_value: object) -> tuple[int, bool]:
  raw_text = str(raw_value or "").strip().lower()
  if raw_text in {"all", "max", "gesamt", "0"}:
    return 3650, True
  try:
    parsed = int(raw_text or "30")
  except ValueError:
    parsed = 30
  parsed = max(1, min(parsed, 3650))
  return parsed, False


def parse_analytics_range_datetime(raw_value: object, *, end_of_day: bool = False) -> datetime | None:
  raw_text = str(raw_value or "").strip()
  if not raw_text:
    return None

  parsed = parse_datetime_utc(raw_text)
  if parsed is None:
    return None

  if DATE_ONLY_PATTERN.match(raw_text):
    parsed = parsed.replace(hour=0, minute=0, second=0, microsecond=0)
    if end_of_day:
      parsed = parsed + timedelta(days=1)
  return parsed


def classify_purchase_revenue_bucket(treatment_id: str, metadata: dict) -> str:
  purchase_type = str(metadata.get("purchaseType") or metadata.get("purchase_type") or "").strip().lower()
  source = str(metadata.get("source") or metadata.get("origin") or "").strip().lower()
  trigger_type = str(metadata.get("triggerType") or "").strip().lower()
  channel = str(metadata.get("channel") or "").strip().lower()

  if (
    purchase_type in {"custom_plan", "custom", "plan"}
    or treatment_id.startswith("plan_")
    or "custom" in treatment_id
  ):
    return "customPlans"
  if source in {"campaign", "offer", "notification"}:
    return "notificationOffers"
  if trigger_type and trigger_type != "broadcast":
    return "notificationOffers"
  if channel in {"push", "email", "sms"}:
    return "notificationOffers"
  return "shop"


def calculate_delta_payload(current_value: float, baseline_value: float) -> dict:
  safe_current = float(current_value or 0)
  safe_baseline = float(baseline_value or 0)
  delta = safe_current - safe_baseline
  if safe_baseline == 0:
    delta_percent = 0.0 if safe_current == 0 else 100.0
  else:
    delta_percent = (delta / safe_baseline) * 100.0
  return {
    "current": int(round(safe_current)),
    "baseline": int(round(safe_baseline)),
    "delta": int(round(delta)),
    "deltaPercent": round(delta_percent, 2),
  }


def build_analytics_comparison_payload(current_result: dict, baseline_result: dict | None, mode: str) -> dict:
  compare_mode = mode if mode in {"prev", "yoy"} else "none"
  output = {
    "mode": compare_mode,
    "enabled": bool(compare_mode != "none" and baseline_result),
    "currentWindow": current_result.get("window") or {},
    "baselineWindow": (baseline_result or {}).get("window") or {},
    "deltas": {},
  }
  if not output["enabled"] or baseline_result is None:
    return output

  current_summary = current_result.get("summary") or {}
  baseline_summary = baseline_result.get("summary") or {}
  metric_keys = [
    "dailyProcessingCents",
    "revenueCents",
    "membershipsMrrCents",
    "appUserLtvCents",
    "clientLtvCents",
    "activeUsers",
    "rewardClaim",
    "appOpen",
    "purchaseSuccess",
  ]
  for key in metric_keys:
    output["deltas"][key] = calculate_delta_payload(
      float(current_summary.get(key) or 0),
      float(baseline_summary.get(key) or 0),
    )

  return output


def build_clinic_analytics_summary(
  clinic_id: int,
  days: int,
  window_end: datetime | None = None,
  window_start: datetime | None = None,
) -> dict:
  safe_days = max(1, min(days, 3650))
  end_dt = window_end or utc_now()
  if end_dt.tzinfo is None:
    end_dt = end_dt.replace(tzinfo=timezone.utc)

  if window_start is not None:
    since_dt = window_start
    if since_dt.tzinfo is None:
      since_dt = since_dt.replace(tzinfo=timezone.utc)
    if since_dt >= end_dt:
      since_dt = end_dt - timedelta(days=1)
    duration_seconds = max(1, int((end_dt - since_dt).total_seconds()))
    safe_days = max(1, min((duration_seconds + 86399) // 86400, 3650))
  else:
    since_dt = end_dt - timedelta(days=safe_days)

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        id,
        user_id,
        event_name,
        treatment_id,
        amount_cents,
        metadata_json,
        created_at
      FROM analytics_events
      WHERE clinic_id = ?
      ORDER BY created_at DESC
      """,
      (clinic_id,),
    ).fetchall()
    membership_rows = conn.execute(
      """
      SELECT
        status,
        monthly_amount_cents,
        membership_name,
        membership_id
      FROM patient_memberships
      WHERE clinic_id = ?
      """,
      (clinic_id,),
    ).fetchall()
    clinic_users = conn.execute(
      """
      SELECT
        id,
        full_name,
        email,
        role
      FROM users
      WHERE clinic_id = ?
      ORDER BY id ASC
      """,
      (clinic_id,),
    ).fetchall()
    audit_rows = conn.execute(
      """
      SELECT
        actor_user_id,
        action,
        created_at
      FROM audit_logs
      WHERE clinic_id = ?
      ORDER BY created_at DESC
      LIMIT 10000
      """,
      (clinic_id,),
    ).fetchall()

  counters = {
    "appOpen": 0,
    "offerView": 0,
    "addToCart": 0,
    "purchaseSuccess": 0,
    "membershipJoin": 0,
    "rewardClaim": 0,
    "rewardRedeem": 0,
    "campaignRun": 0,
    "campaignDelivery": 0,
    "eventsTotal": 0,
    "revenueCents": 0,
  }
  revenue_sources = {
    "memberships": 0,
    "rewardsCashBalance": 0,
    "notificationOffers": 0,
    "customPlans": 0,
    "shop": 0,
  }

  team_stats = {
    int(row["id"]): {
      "userId": int(row["id"]),
      "name": str(row["full_name"] or row["email"] or "Team"),
      "email": str(row["email"] or ""),
      "role": str(row["role"] or ""),
      "salesCents": 0,
      "directRevenueCents": 0,
      "campaignInfluenceCents": 0,
      "campaignDeliveries": 0,
      "actions": 0,
    }
    for row in clinic_users
  }

  treatment_stats = {}
  session_keys = set()
  user_ids = set()
  day_buckets = {}

  for row in rows:
    parsed_created_at = parse_datetime_utc(row["created_at"])
    if parsed_created_at is None:
      continue
    if parsed_created_at < since_dt or parsed_created_at >= end_dt:
      continue
    counters["eventsTotal"] += 1

    event_name = str(row["event_name"] or "").lower()
    treatment_id = str(row["treatment_id"] or "").strip()
    amount = int(row["amount_cents"] or 0)
    metadata = parse_event_metadata(row["metadata_json"])

    raw_user_id = row["user_id"]
    user_id = None
    if raw_user_id is not None:
      try:
        user_id = int(raw_user_id)
        user_ids.add(user_id)
      except (TypeError, ValueError):
        user_id = None

    session_id = str(metadata.get("sessionId") or "").strip()
    if session_id:
      session_keys.add(session_id)

    day_key = parsed_created_at.date().isoformat()
    bucket = day_buckets.setdefault(
      day_key,
      {
        "date": day_key,
        "appOpen": 0,
        "offerView": 0,
        "addToCart": 0,
        "purchaseSuccess": 0,
        "revenueCents": 0,
      },
    )

    if event_name == "app_open":
      counters["appOpen"] += 1
      bucket["appOpen"] += 1
    elif event_name == "offer_view":
      counters["offerView"] += 1
      bucket["offerView"] += 1
    elif event_name == "add_to_cart":
      counters["addToCart"] += 1
      bucket["addToCart"] += 1
    elif event_name == "purchase_success":
      counters["purchaseSuccess"] += 1
      counters["revenueCents"] += amount
      bucket["purchaseSuccess"] += 1
      bucket["revenueCents"] += amount
      source_key = classify_purchase_revenue_bucket(treatment_id, metadata)
      revenue_sources[source_key] += max(0, amount)
    elif event_name == "membership_join":
      counters["membershipJoin"] += 1
    elif event_name == "reward_claim":
      counters["rewardClaim"] += 1
    elif event_name == "reward_redeem":
      counters["rewardRedeem"] += 1
      redeem_amount = max(0, amount or parse_non_negative_int(metadata.get("valueCents"), 0))
      revenue_sources["rewardsCashBalance"] += redeem_amount
    elif event_name == "campaign_run":
      counters["campaignRun"] += 1
    elif event_name == "campaign_delivery":
      counters["campaignDelivery"] += 1

    if user_id is not None and user_id in team_stats:
      team_entry = team_stats[user_id]
      team_entry["actions"] += 1
      if event_name == "purchase_success":
        team_entry["directRevenueCents"] += max(0, amount)
      elif event_name in {"campaign_run", "campaign_delivery"}:
        sent = parse_non_negative_int(metadata.get("sent"), 0)
        if sent <= 0 and event_name == "campaign_run":
          sent = parse_non_negative_int(metadata.get("attempted"), 0)
        team_entry["campaignDeliveries"] += sent

    if treatment_id:
      treatment = treatment_stats.setdefault(
        treatment_id,
        {
          "treatmentId": treatment_id,
          "views": 0,
          "addsToCart": 0,
          "purchases": 0,
          "revenueCents": 0,
        },
      )
      if event_name == "offer_view":
        treatment["views"] += 1
      elif event_name == "add_to_cart":
        treatment["addsToCart"] += 1
      elif event_name == "purchase_success":
        treatment["purchases"] += 1
        treatment["revenueCents"] += amount

  for row in audit_rows:
    parsed_created_at = parse_datetime_utc(row["created_at"])
    if parsed_created_at is None:
      continue
    if parsed_created_at < since_dt or parsed_created_at >= end_dt:
      continue
    raw_actor = row["actor_user_id"]
    try:
      actor_id = int(raw_actor)
    except (TypeError, ValueError):
      continue
    if actor_id not in team_stats:
      continue
    team_stats[actor_id]["actions"] += 1

  offer_views = counters["offerView"]
  purchases = counters["purchaseSuccess"]
  adds_to_cart = counters["addToCart"]
  conversion_rate = (purchases / offer_views * 100.0) if offer_views else 0.0
  cart_rate = (adds_to_cart / offer_views * 100.0) if offer_views else 0.0

  top_treatments = sorted(
    treatment_stats.values(),
    key=lambda item: (item["purchases"], item["revenueCents"], item["views"]),
    reverse=True,
  )[:10]

  timeseries = sorted(day_buckets.values(), key=lambda item: item["date"])
  membership_summary = summarize_patient_memberships(list(membership_rows))
  revenue_sources["memberships"] = max(0, int(membership_summary.get("mrrCents") or 0))

  active_users = len(user_ids)
  active_memberships = int(membership_summary["active"])
  revenue_total = int(counters["revenueCents"])
  app_user_ltv_cents = int(round(revenue_total / active_users)) if active_users > 0 else 0
  client_ltv_cents = int(round(revenue_total / active_memberships)) if active_memberships > 0 else 0
  daily_processing_cents = int(timeseries[-1]["revenueCents"]) if timeseries else 0

  avg_order_cents = (revenue_total / purchases) if purchases > 0 else 0.0
  estimated_conversion_ratio = max(min(conversion_rate / 100.0, 0.45), 0.03) if purchases > 0 else 0.03
  for entry in team_stats.values():
    campaign_influence = int(round(entry["campaignDeliveries"] * avg_order_cents * estimated_conversion_ratio))
    entry["campaignInfluenceCents"] = max(0, campaign_influence)
    entry["salesCents"] = max(0, entry["directRevenueCents"] + entry["campaignInfluenceCents"])

  if team_stats and sum(item["salesCents"] for item in team_stats.values()) == 0 and revenue_total > 0:
    total_weight = sum(max(1, int(item["actions"])) for item in team_stats.values())
    if total_weight <= 0:
      total_weight = len(team_stats)
    for entry in team_stats.values():
      weight = max(1, int(entry["actions"]))
      entry["salesCents"] = int(round((weight / total_weight) * revenue_total))

  top_team = sorted(
    team_stats.values(),
    key=lambda item: (item["salesCents"], item["actions"]),
    reverse=True,
  )[:8]

  revenue_source_rows = [
    {
      "key": "memberships",
      "label": "Mitgliedschaften",
      "color": "#16a34a",
      "valueCents": int(revenue_sources["memberships"]),
    },
    {
      "key": "rewardsCashBalance",
      "label": "Rewards & Guthaben",
      "color": "#5b7cfa",
      "valueCents": int(revenue_sources["rewardsCashBalance"]),
    },
    {
      "key": "notificationOffers",
      "label": "Angebotskampagnen",
      "color": "#e91678",
      "valueCents": int(revenue_sources["notificationOffers"]),
    },
    {
      "key": "customPlans",
      "label": "Sonderpläne",
      "color": "#b54708",
      "valueCents": int(revenue_sources["customPlans"]),
    },
    {
      "key": "shop",
      "label": "Shop",
      "color": "#f59e0b",
      "valueCents": int(revenue_sources["shop"]),
    },
  ]

  return {
    "days": safe_days,
    "window": {
      "from": since_dt.isoformat(),
      "to": end_dt.isoformat(),
    },
    "summary": {
      **counters,
      "activeUsers": active_users,
      "activeSessions": len(session_keys),
      "conversionRate": round(conversion_rate, 2),
      "addToCartRate": round(cart_rate, 2),
      "activeMemberships": active_memberships,
      "membershipsMrrCents": membership_summary["mrrCents"],
      "pastDueMemberships": membership_summary["pastDue"],
      "canceledMemberships": membership_summary["canceled"],
      "dailyProcessingCents": daily_processing_cents,
      "appUserLtvCents": app_user_ltv_cents,
      "clientLtvCents": client_ltv_cents,
    },
    "memberships": membership_summary,
    "topTreatments": top_treatments,
    "timeseries": timeseries,
    "revenueSources": revenue_source_rows,
    "topTeam": top_team,
  }


def to_hex_color(value: str, fallback: str) -> str:
  candidate = value.strip()
  if HEX_COLOR_PATTERN.match(candidate):
    return candidate
  return fallback


def normalize_url(value: str) -> str:
  url = value.strip()
  if not url:
    return ""
  if url.startswith(("http://", "https://")):
    return url
  return f"https://{url}"


def is_placeholder_calendly_url(value: str) -> bool:
  normalized = normalize_url(value).lower()
  if not normalized:
    return True
  return any(placeholder in normalized for placeholder in CALENDLY_PLACEHOLDERS)


def resolved_calendly_url() -> str:
  candidate = normalize_url(CALENDLY_URL)
  if not candidate or is_placeholder_calendly_url(candidate):
    return "https://calendly.com/"
  return candidate


def parse_amount_to_cents(raw_value: object) -> int | None:
  try:
    amount = float(raw_value)
  except (TypeError, ValueError):
    return None
  amount_cents = int(round(amount * 100))
  if amount_cents < 100:
    return None
  return amount_cents


def map_stripe_subscription_status(raw_status: object, fallback: str = "inactive") -> str:
  normalized = str(raw_status or "").strip().lower()
  mapped = STRIPE_TO_ADMIN_SUBSCRIPTION_STATUS.get(normalized, normalized)
  if mapped in ADMIN_SUBSCRIPTION_STATUSES:
    return mapped
  if fallback in ADMIN_SUBSCRIPTION_STATUSES:
    return fallback
  return "inactive"


def parse_checkout_payment_method_types(raw_value: object) -> list[str]:
  if raw_value is None:
    return []

  if isinstance(raw_value, (list, tuple, set)):
    candidates = [str(value).strip().lower() for value in raw_value]
  else:
    candidates = [part.strip().lower() for part in re.split(r"[,\s]+", str(raw_value))]

  resolved: list[str] = []
  for candidate in candidates:
    if not candidate or candidate not in SUPPORTED_CHECKOUT_PAYMENT_METHOD_TYPES:
      continue
    if candidate not in resolved:
      resolved.append(candidate)
  return resolved


def resolve_user_id_by_subscription(stripe_subscription_id: str | None) -> int | None:
  if not stripe_subscription_id:
    return None

  with get_db() as conn:
    row = conn.execute(
      "SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ? LIMIT 1",
      (stripe_subscription_id,),
    ).fetchone()
    if row and row["user_id"]:
      return int(row["user_id"])

    row = conn.execute(
      "SELECT id FROM users WHERE stripe_subscription_id = ? LIMIT 1",
      (stripe_subscription_id,),
    ).fetchone()

  return int(row["id"]) if row else None


def unix_to_iso(value: object) -> str | None:
  if value is None:
    return None
  try:
    timestamp = int(value)
  except (TypeError, ValueError):
    return None
  return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def resolve_user_id_by_customer(customer_id: str | None) -> int | None:
  if not customer_id:
    return None
  with get_db() as conn:
    row = conn.execute(
      "SELECT id FROM users WHERE stripe_customer_id = ? LIMIT 1",
      (customer_id,),
    ).fetchone()
  return int(row["id"]) if row else None


def upsert_subscription_record(
  user_id: int | None,
  stripe_session_id: str | None,
  stripe_customer_id: str | None,
  stripe_subscription_id: str | None,
  plan_name: str,
  amount_cents: int,
  currency: str,
  status: str,
  current_period_end: str | None,
) -> None:
  with get_db() as conn:
    if stripe_subscription_id:
      conn.execute(
        """
        INSERT INTO subscriptions (
          user_id,
          stripe_session_id,
          stripe_customer_id,
          stripe_subscription_id,
          plan_name,
          amount_cents,
          currency,
          status,
          current_period_end
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(stripe_subscription_id) DO UPDATE SET
          user_id = COALESCE(excluded.user_id, subscriptions.user_id),
          stripe_session_id = COALESCE(excluded.stripe_session_id, subscriptions.stripe_session_id),
          stripe_customer_id = COALESCE(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
          plan_name = excluded.plan_name,
          amount_cents = excluded.amount_cents,
          currency = excluded.currency,
          status = excluded.status,
          current_period_end = COALESCE(excluded.current_period_end, subscriptions.current_period_end),
          updated_at = CURRENT_TIMESTAMP
        """,
        (
          user_id,
          stripe_session_id,
          stripe_customer_id,
          stripe_subscription_id,
          plan_name,
          amount_cents,
          currency,
          status,
          current_period_end,
        ),
      )
      return

    if stripe_session_id:
      conn.execute(
        """
        INSERT INTO subscriptions (
          user_id,
          stripe_session_id,
          stripe_customer_id,
          plan_name,
          amount_cents,
          currency,
          status,
          current_period_end
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(stripe_session_id) DO UPDATE SET
          user_id = COALESCE(excluded.user_id, subscriptions.user_id),
          stripe_customer_id = COALESCE(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
          plan_name = excluded.plan_name,
          amount_cents = excluded.amount_cents,
          currency = excluded.currency,
          status = excluded.status,
          current_period_end = COALESCE(excluded.current_period_end, subscriptions.current_period_end),
          updated_at = CURRENT_TIMESTAMP
        """,
        (
          user_id,
          stripe_session_id,
          stripe_customer_id,
          plan_name,
          amount_cents,
          currency,
          status,
          current_period_end,
        ),
      )


def update_user_billing_state(
  user_id: int,
  subscription_status: str,
  stripe_customer_id: str | None,
  stripe_subscription_id: str | None,
) -> None:
  with get_db() as conn:
    clinic_row = conn.execute(
      "SELECT clinic_id FROM users WHERE id = ? LIMIT 1",
      (user_id,),
    ).fetchone()

    conn.execute(
      """
      UPDATE users
      SET
        subscription_status = ?,
        stripe_customer_id = COALESCE(?, stripe_customer_id),
        stripe_subscription_id = COALESCE(?, stripe_subscription_id)
      WHERE id = ?
      """,
      (subscription_status, stripe_customer_id, stripe_subscription_id, user_id),
    )

    clinic_id = int(clinic_row["clinic_id"]) if clinic_row and clinic_row["clinic_id"] else None
    if clinic_id is not None:
      conn.execute(
        """
        UPDATE clinics
        SET
          subscription_status = ?,
          stripe_customer_id = COALESCE(?, stripe_customer_id),
          stripe_subscription_id = COALESCE(?, stripe_subscription_id)
        WHERE id = ?
        """,
        (subscription_status, stripe_customer_id, stripe_subscription_id, clinic_id),
      )


def handle_checkout_session_completed(checkout_session: dict) -> None:
  if checkout_session.get("mode") != "subscription":
    return

  metadata = checkout_session.get("metadata") or {}
  user_id_raw = metadata.get("user_id") or checkout_session.get("client_reference_id")

  try:
    user_id = int(user_id_raw)
  except (TypeError, ValueError):
    user_id = None

  amount_cents = int(
    checkout_session.get("amount_total")
    or metadata.get("amount_cents")
    or APPOINTMENTIX_MONTHLY_AMOUNT_CENTS
  )
  currency = str(checkout_session.get("currency") or "eur").lower()
  fallback_status = "active" if checkout_session.get("payment_status") == "paid" else "incomplete"
  status = map_stripe_subscription_status(fallback_status, fallback=fallback_status)
  plan_name = metadata.get("plan_name") or APPOINTMENTIX_PLAN_NAME

  stripe_customer_id = checkout_session.get("customer")
  stripe_subscription_id = checkout_session.get("subscription")
  current_period_end = None

  if stripe_runtime_ready() and stripe_subscription_id:
    try:
      subscription = stripe.Subscription.retrieve(stripe_subscription_id)
      status = map_stripe_subscription_status(subscription.get("status"), fallback=status)
      current_period_end = unix_to_iso(subscription.get("current_period_end"))
      items = ((subscription.get("items") or {}).get("data") or [])
      if items:
        first_price = items[0].get("price") or {}
        amount_cents = int(first_price.get("unit_amount") or amount_cents)
        currency = str(first_price.get("currency") or currency).lower()
    except Exception:
      current_period_end = None

  if user_id is not None:
    update_user_billing_state(user_id, status, stripe_customer_id, stripe_subscription_id)
    user_row = get_user_row_by_id(user_id)
    if user_row and user_row["clinic_id"]:
      create_audit_log(
        clinic_id=int(user_row["clinic_id"]),
        actor_user_id=user_id,
        action="billing.checkout_completed",
        entity_type="subscription",
        entity_id=str(stripe_subscription_id or ""),
        metadata={
          "status": status,
          "amountCents": amount_cents,
          "planName": plan_name,
          "stripeSessionId": checkout_session.get("id"),
        },
      )

  upsert_subscription_record(
    user_id=user_id,
    stripe_session_id=checkout_session.get("id"),
    stripe_customer_id=stripe_customer_id,
    stripe_subscription_id=stripe_subscription_id,
    plan_name=plan_name,
    amount_cents=amount_cents,
    currency=currency,
    status=status,
    current_period_end=current_period_end,
  )


def handle_subscription_changed(subscription: dict) -> None:
  stripe_subscription_id = subscription.get("id")
  stripe_customer_id = subscription.get("customer")
  status = map_stripe_subscription_status(subscription.get("status"), fallback="inactive")
  current_period_end = unix_to_iso(subscription.get("current_period_end"))

  amount_cents = APPOINTMENTIX_MONTHLY_AMOUNT_CENTS
  items = ((subscription.get("items") or {}).get("data") or [])
  currency = str(subscription.get("currency") or "eur").lower()
  if items:
    first_price = items[0].get("price") or {}
    amount_cents = int((first_price.get("unit_amount")) or amount_cents)
    currency = str(first_price.get("currency") or currency).lower()

  metadata = subscription.get("metadata") or {}
  user_id = None
  user_id_raw = metadata.get("user_id")
  if user_id_raw is not None:
    try:
      user_id = int(user_id_raw)
    except (TypeError, ValueError):
      user_id = None
  if user_id is None:
    user_id = resolve_user_id_by_customer(stripe_customer_id)
  if user_id is None:
    user_id = resolve_user_id_by_subscription(stripe_subscription_id)

  if user_id is not None:
    update_user_billing_state(user_id, status, stripe_customer_id, stripe_subscription_id)
    user_row = get_user_row_by_id(user_id)
    if user_row and user_row["clinic_id"]:
      create_audit_log(
        clinic_id=int(user_row["clinic_id"]),
        actor_user_id=user_id,
        action="billing.subscription_updated",
        entity_type="subscription",
        entity_id=str(stripe_subscription_id or ""),
        metadata={
          "status": status,
          "amountCents": amount_cents,
          "currentPeriodEnd": current_period_end,
        },
      )

  upsert_subscription_record(
    user_id=user_id,
    stripe_session_id=None,
    stripe_customer_id=stripe_customer_id,
    stripe_subscription_id=stripe_subscription_id,
    plan_name=APPOINTMENTIX_PLAN_NAME,
    amount_cents=amount_cents,
    currency=currency,
    status=status,
    current_period_end=current_period_end,
  )


def handle_invoice_event(invoice: dict, default_status: str) -> None:
  stripe_subscription_id = invoice.get("subscription")
  stripe_customer_id = invoice.get("customer")
  if not stripe_subscription_id and not stripe_customer_id:
    return

  status = map_stripe_subscription_status(default_status, fallback="inactive")
  current_period_end = unix_to_iso(invoice.get("period_end"))
  amount_cents = int(
    invoice.get("amount_paid")
    or invoice.get("amount_due")
    or invoice.get("subtotal")
    or APPOINTMENTIX_MONTHLY_AMOUNT_CENTS
  )
  currency = str(invoice.get("currency") or "eur").lower()

  if stripe_runtime_ready() and stripe_subscription_id:
    try:
      subscription = stripe.Subscription.retrieve(stripe_subscription_id)
      status = map_stripe_subscription_status(subscription.get("status"), fallback=status)
      current_period_end = unix_to_iso(subscription.get("current_period_end")) or current_period_end
      items = ((subscription.get("items") or {}).get("data") or [])
      if items:
        first_price = items[0].get("price") or {}
        amount_cents = int(first_price.get("unit_amount") or amount_cents)
        currency = str(first_price.get("currency") or currency).lower()
    except Exception:
      pass

  user_id = resolve_user_id_by_customer(stripe_customer_id)
  if user_id is None:
    user_id = resolve_user_id_by_subscription(stripe_subscription_id)

  if user_id is not None:
    update_user_billing_state(user_id, status, stripe_customer_id, stripe_subscription_id)
    user_row = get_user_row_by_id(user_id)
    if user_row and user_row["clinic_id"]:
      create_audit_log(
        clinic_id=int(user_row["clinic_id"]),
        actor_user_id=user_id,
        action="billing.invoice_status_updated",
        entity_type="subscription",
        entity_id=str(stripe_subscription_id or ""),
        metadata={
          "status": status,
          "amountCents": amount_cents,
          "currentPeriodEnd": current_period_end,
        },
      )

  upsert_subscription_record(
    user_id=user_id,
    stripe_session_id=None,
    stripe_customer_id=stripe_customer_id,
    stripe_subscription_id=stripe_subscription_id,
    plan_name=APPOINTMENTIX_PLAN_NAME,
    amount_cents=amount_cents,
    currency=currency,
    status=status,
    current_period_end=current_period_end,
  )


@app.get("/")
def serve_index():
  return send_from_directory(BASE_DIR, "index.html")


@app.get("/dashboard")
def serve_dashboard():
  return send_from_directory(BASE_DIR, "dashboard.html")


@app.get("/admin")
def serve_admin():
  return send_from_directory(BASE_DIR, "admin.html")


@app.get("/catalog")
def serve_catalog():
  return send_from_directory(BASE_DIR, "catalog.html")


@app.get("/api/admin/config")
def admin_config():
  return jsonify({"configured": superadmin_configured()})


@app.post("/api/admin/login")
def admin_login():
  if not superadmin_configured():
    return jsonify({"error": "Super-Admin ist nicht konfiguriert."}), 503

  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))

  if not email or not password:
    return jsonify({"error": "E-Mail und Passwort sind erforderlich."}), 400

  if email != SUPERADMIN_EMAIL or not verify_superadmin_password(password):
    return jsonify({"error": "Ungültige Admin-Zugangsdaten."}), 401

  session.clear()
  session["superadmin_authenticated"] = True
  session["superadmin_email"] = SUPERADMIN_EMAIL

  return jsonify({"admin": {"email": SUPERADMIN_EMAIL}})


@app.post("/api/admin/logout")
def admin_logout():
  session.pop("superadmin_authenticated", None)
  session.pop("superadmin_email", None)
  return jsonify({"success": True})


@app.get("/api/admin/me")
def admin_me():
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error
  return jsonify({"admin": admin})


@app.get("/api/admin/overview")
def admin_overview():
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error

  with get_db() as conn:
    clinics_total = int(conn.execute("SELECT COUNT(*) AS count FROM clinics").fetchone()["count"])
    users_total = int(conn.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"])
    owners_total = int(
      conn.execute(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'owner'"
      ).fetchone()["count"]
    )
    staff_total = int(
      conn.execute(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'staff'"
      ).fetchone()["count"]
    )
    active_clinics = int(
      conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM clinics
        WHERE subscription_status IN ('active', 'trialing')
        """
      ).fetchone()["count"]
    )
    subscriptions_active = int(
      conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM subscriptions
        WHERE status IN ('active', 'trialing')
        """
      ).fetchone()["count"]
    )
    lead_rows = conn.execute("SELECT created_at FROM leads").fetchall()

  seven_days_ago = utc_now() - timedelta(days=7)
  leads_last_7_days = 0
  for row in lead_rows:
    raw_created_at = str(row["created_at"] or "").strip()
    if not raw_created_at:
      continue
    try:
      parsed = datetime.fromisoformat(raw_created_at)
    except ValueError:
      continue
    if parsed.tzinfo is None:
      parsed = parsed.replace(tzinfo=timezone.utc)
    if parsed >= seven_days_ago:
      leads_last_7_days += 1

  return jsonify(
    {
      "overview": {
        "clinicsTotal": clinics_total,
        "usersTotal": users_total,
        "ownersTotal": owners_total,
        "staffTotal": staff_total,
        "activeClinics": active_clinics,
        "subscriptionsActive": subscriptions_active,
        "leadsLast7Days": leads_last_7_days,
      }
    }
  )


@app.get("/api/admin/clinics")
def admin_clinics():
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error

  search_query = str(request.args.get("q", "")).strip().lower()
  try:
    limit = int(request.args.get("limit", "100"))
  except ValueError:
    limit = 100
  limit = max(1, min(limit, 250))

  pattern = f"%{search_query}%"

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        c.id,
        c.name,
        c.website,
        c.brand_color,
        c.accent_color,
        c.subscription_status,
        c.created_at,
        (
          SELECT COUNT(*)
          FROM users u
          WHERE u.clinic_id = c.id
        ) AS members_count,
        (
          SELECT COUNT(*)
          FROM users u
          WHERE u.clinic_id = c.id AND u.role = 'owner'
        ) AS owners_count,
        (
          SELECT COUNT(*)
          FROM users u
          WHERE u.clinic_id = c.id AND u.role = 'staff'
        ) AS staff_count,
        (
          SELECT u.email
          FROM users u
          WHERE u.clinic_id = c.id AND u.role = 'owner'
          ORDER BY u.id ASC
          LIMIT 1
        ) AS owner_email
      FROM clinics c
      WHERE
        (? = '')
        OR LOWER(c.name) LIKE ?
        OR LOWER(c.website) LIKE ?
        OR EXISTS (
          SELECT 1
          FROM users u
          WHERE u.clinic_id = c.id AND LOWER(u.email) LIKE ?
        )
      ORDER BY c.id DESC
      LIMIT ?
      """,
      (search_query, pattern, pattern, pattern, limit),
    ).fetchall()

  clinics = []
  for row in rows:
    clinics.append(
      {
        "id": row["id"],
        "name": row["name"],
        "website": row["website"],
        "brandColor": row["brand_color"],
        "accentColor": row["accent_color"],
        "subscriptionStatus": row["subscription_status"],
        "createdAt": row["created_at"],
        "membersCount": row["members_count"],
        "ownersCount": row["owners_count"],
        "staffCount": row["staff_count"],
        "ownerEmail": row["owner_email"],
      }
    )

  return jsonify({"clinics": clinics})


@app.get("/api/admin/clinics/<int:clinic_id>")
def admin_clinic_detail(clinic_id: int):
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  with get_db() as conn:
    member_rows = conn.execute(
      """
      SELECT
        id,
        full_name,
        email,
        role,
        created_at
      FROM users
      WHERE clinic_id = ?
      ORDER BY role DESC, created_at ASC
      """,
      (clinic_id,),
    ).fetchall()

    subscription_rows = conn.execute(
      """
      SELECT
        s.id,
        s.plan_name,
        s.amount_cents,
        s.currency,
        s.status,
        s.current_period_end,
        s.updated_at,
        u.email AS user_email
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE u.clinic_id = ?
      ORDER BY s.id DESC
      LIMIT 20
      """,
      (clinic_id,),
    ).fetchall()

    payments_summary = conn.execute(
      """
      SELECT
        COUNT(*) AS paid_count,
        COALESCE(SUM(p.amount_cents), 0) AS paid_total_cents
      FROM payments p
      INNER JOIN users u ON u.id = p.user_id
      WHERE u.clinic_id = ? AND p.status = 'paid'
      """,
      (clinic_id,),
    ).fetchone()

  return jsonify(
    {
      "clinic": serialize_admin_clinic(clinic_row),
      "members": [
        {
          "id": row["id"],
          "fullName": row["full_name"],
          "email": row["email"],
          "role": row["role"],
          "createdAt": row["created_at"],
        }
        for row in member_rows
      ],
      "subscriptions": [
        {
          "id": row["id"],
          "planName": row["plan_name"],
          "amountCents": row["amount_cents"],
          "currency": row["currency"],
          "status": row["status"],
          "currentPeriodEnd": row["current_period_end"],
          "updatedAt": row["updated_at"],
          "userEmail": row["user_email"],
        }
        for row in subscription_rows
      ],
      "paymentsSummary": {
        "paidCount": int(payments_summary["paid_count"]),
        "paidTotalCents": int(payments_summary["paid_total_cents"]),
      },
    }
  )


@app.put("/api/admin/clinics/<int:clinic_id>/subscription")
def admin_update_subscription(clinic_id: int):
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}
  subscription_status = str(payload.get("subscriptionStatus", "")).strip().lower()

  if subscription_status not in ADMIN_SUBSCRIPTION_STATUSES:
    return jsonify({"error": "Ungültiger Subscription-Status."}), 400

  with get_db() as conn:
    conn.execute(
      """
      UPDATE clinics
      SET subscription_status = ?
      WHERE id = ?
      """,
      (subscription_status, clinic_id),
    )
    conn.execute(
      """
      UPDATE users
      SET subscription_status = ?
      WHERE clinic_id = ?
      """,
      (subscription_status, clinic_id),
    )

  updated_row = get_clinic_row_by_id(clinic_id)
  return jsonify({"clinic": serialize_admin_clinic(updated_row)})


@app.get("/api/admin/leads")
def admin_leads():
  admin, auth_error = require_superadmin()
  if not admin:
    return auth_error

  try:
    limit = int(request.args.get("limit", "50"))
  except ValueError:
    limit = 50
  limit = max(1, min(limit, 200))

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        id,
        full_name,
        email,
        phone,
        company_name,
        website,
        has_devices,
        recurring_revenue_band,
        brand_color,
        font_family,
        created_at
      FROM leads
      ORDER BY id DESC
      LIMIT ?
      """,
      (limit,),
    ).fetchall()

  return jsonify(
    {
      "leads": [
        {
          "id": row["id"],
          "fullName": row["full_name"],
          "email": row["email"],
          "phone": row["phone"],
          "companyName": row["company_name"],
          "website": row["website"],
          "hasDevices": row["has_devices"],
          "recurringRevenueBand": row["recurring_revenue_band"],
          "brandColor": row["brand_color"],
          "fontFamily": row["font_family"],
          "createdAt": row["created_at"],
        }
        for row in rows
      ]
    }
  )


@app.get("/api/health")
def health():
  return jsonify({"status": "ok"})


@app.get("/api/config/public")
def public_config():
  stripe_enabled = stripe_runtime_ready()
  calendly_url = resolved_calendly_url()
  return jsonify(
    {
      "stripePublishableKey": STRIPE_PUBLISHABLE_KEY if stripe_enabled else "",
      "stripeEnabled": stripe_enabled,
      "stripeConfigured": stripe_enabled,
      "calendlyUrl": calendly_url,
      "calendlyConfigured": not is_placeholder_calendly_url(CALENDLY_URL),
      "appointmentixPlanName": APPOINTMENTIX_PLAN_NAME,
      "appointmentixMonthlyAmountEur": APPOINTMENTIX_MONTHLY_AMOUNT_CENTS / 100,
    }
  )


@app.post("/api/leads")
def create_lead():
  payload = request.get_json(silent=True) or {}

  full_name = str(payload.get("fullName", "")).strip()
  email = str(payload.get("email", "")).strip().lower()
  phone = str(payload.get("phone", "")).strip()
  company_name = str(payload.get("companyName", "")).strip()
  website = normalize_url(str(payload.get("website", "")).strip())
  has_devices = str(payload.get("hasDevices", "")).strip()
  recurring_revenue_band = str(payload.get("recurringRevenueBand", "")).strip()
  brand_color = to_hex_color(str(payload.get("brandColor", "#8A5A2F")), "#8A5A2F")
  font_family = str(payload.get("fontFamily", "Gabarito, DM Sans, sans-serif")).strip()

  consent_sms = bool(payload.get("consentSms"))
  consent_marketing = bool(payload.get("consentMarketing"))

  if len(full_name) < 2:
    return jsonify({"error": "Bitte gib deinen vollständigen Namen an."}), 400
  if "@" not in email or "." not in email:
    return jsonify({"error": "Bitte gib eine gültige E-Mail ein."}), 400
  if len(phone) < 6:
    return jsonify({"error": "Bitte gib eine gültige Telefonnummer ein."}), 400
  if len(company_name) < 2:
    return jsonify({"error": "Bitte gib deinen Kliniknamen an."}), 400
  if not website:
    return jsonify({"error": "Bitte gib eine Website-URL ein."}), 400
  if has_devices not in LEAD_DEVICE_OPTIONS:
    return jsonify({"error": "Bitte wähle die passende Geräte-Option aus."}), 400
  if recurring_revenue_band not in LEAD_REVENUE_OPTIONS:
    return jsonify({"error": "Bitte wähle deinen Umsatzbereich aus."}), 400
  if not consent_sms:
    return jsonify({"error": "Bitte bestätige die Kontakt-Einwilligung."}), 400
  if len(font_family) > 120:
    return jsonify({"error": "Bitte wähle eine gültige Schriftart."}), 400

  with get_db() as conn:
    lead_id = insert_and_get_id(
      conn,
      """
      INSERT INTO leads (
        full_name,
        email,
        phone,
        company_name,
        website,
        has_devices,
        recurring_revenue_band,
        consent_sms,
        consent_marketing,
        brand_color,
        font_family
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        full_name,
        email,
        phone,
        company_name,
        website,
        has_devices,
        recurring_revenue_band,
        1 if consent_sms else 0,
        1 if consent_marketing else 0,
        brand_color,
        font_family,
      ),
    )

  return jsonify(
    {
      "success": True,
      "leadId": lead_id,
      "calendlyUrl": resolved_calendly_url(),
      "calendlyConfigured": not is_placeholder_calendly_url(CALENDLY_URL),
    }
  ), 201


@app.post("/api/auth/register")
def register():
  payload = request.get_json(silent=True) or {}
  full_name = str(payload.get("fullName", "")).strip()
  clinic_name = str(payload.get("clinicName", "")).strip()
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))

  if not full_name or not clinic_name:
    return jsonify({"error": "Name und Klinikname sind erforderlich."}), 400
  if "@" not in email or "." not in email:
    return jsonify({"error": "Bitte gültige E-Mail eingeben."}), 400
  if len(password) < 8:
    return jsonify({"error": "Passwort muss mindestens 8 Zeichen haben."}), 400

  password_hash = generate_password_hash(password, method="pbkdf2:sha256")

  try:
    with get_db() as conn:
      clinic_id = insert_and_get_id(
        conn,
        """
        INSERT INTO clinics (
          name,
          logo_url,
          website,
          brand_color,
          accent_color,
          font_family,
          design_preset,
          calendly_url,
          subscription_status
        )
        VALUES (?, '', '', '#16A34A', '#EB6C13', 'Gabarito, DM Sans, sans-serif', 'clean', ?, 'inactive')
        """,
        (clinic_name, CALENDLY_URL),
      )
      ensure_clinic_catalog_row(conn, int(clinic_id), clinic_name)

      user_id = insert_and_get_id(
        conn,
        """
        INSERT INTO users (
          clinic_id,
          role,
          email,
          password_hash,
          full_name,
          clinic_name,
          logo_url,
          website,
          brand_color,
          accent_color,
          font_family,
          design_preset,
          calendly_url,
          subscription_status
        )
        VALUES (?, 'owner', ?, ?, ?, ?, '', '', '#16A34A', '#EB6C13', 'Gabarito, DM Sans, sans-serif', 'clean', ?, 'inactive')
        """,
        (clinic_id, email, password_hash, full_name, clinic_name, CALENDLY_URL),
      )
      user_row = conn.execute(
        """
        SELECT
          id,
          clinic_id,
          role,
          email,
          full_name,
          clinic_name,
          logo_url,
          website,
          brand_color,
          accent_color,
          font_family,
          design_preset,
          calendly_url,
          subscription_status,
          stripe_customer_id,
          stripe_subscription_id,
          created_at
        FROM users
        WHERE id = ?
        """,
        (user_id,),
      ).fetchone()
  except Exception as exc:
    if is_unique_violation(exc):
      return jsonify({"error": "Diese E-Mail ist bereits registriert."}), 409
    raise

  if not user_row:
    return jsonify({"error": "Registrierung fehlgeschlagen."}), 500

  session["user_id"] = user_id
  api_token = issue_api_token(int(user_id))
  return jsonify(
    {
      "user": serialize_user(user_row),
      "token": api_token,
      "tokenType": "Bearer",
      "tokenTtlDays": API_TOKEN_TTL_DAYS,
    }
  ), 201


@app.post("/api/auth/login")
def login():
  payload = request.get_json(silent=True) or {}
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))

  if not email or not password:
    return jsonify({"error": "E-Mail und Passwort sind erforderlich."}), 400

  with get_db() as conn:
    user_row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        role,
        email,
        password_hash,
        full_name,
        clinic_name,
        logo_url,
        website,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      FROM users
      WHERE email = ?
      """,
      (email,),
    ).fetchone()

  if not user_row or not check_password_hash(user_row["password_hash"], password):
    return jsonify({"error": "Ungültige Login-Daten."}), 401

  session["user_id"] = user_row["id"]
  api_token = issue_api_token(int(user_row["id"]))
  return jsonify(
    {
      "user": serialize_user(user_row),
      "token": api_token,
      "tokenType": "Bearer",
      "tokenTtlDays": API_TOKEN_TTL_DAYS,
    }
  )


@app.post("/api/auth/logout")
def logout():
  revoke_api_token(parse_bearer_token())
  session.clear()
  return jsonify({"success": True})


@app.post("/api/auth/logout-all")
def logout_all():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error
  revoke_all_user_tokens(int(user_row["id"]))
  session.clear()
  return jsonify({"success": True})


@app.get("/api/auth/me")
def me():
  user_row = get_current_user_row()
  if not user_row:
    return jsonify({"error": "Nicht angemeldet."}), 401
  return jsonify({"user": serialize_user(user_row)})


@app.get("/api/mobile/clinic-bundle")
def mobile_clinic_bundle():
  clinic_name = str(request.args.get("clinicName", "")).strip()
  clinic_row = None

  if clinic_name:
    clinic_row = get_clinic_row_by_name(clinic_name)
  else:
    user_row = get_current_user_row()
    if user_row and user_row["clinic_id"]:
      clinic_row = get_clinic_row_by_id(int(user_row["clinic_id"]))

  if not clinic_row:
    if clinic_name:
      return jsonify({"error": "Klinik nicht gefunden."}), 404
    return jsonify({"error": "Bitte clinicName übergeben oder anmelden."}), 400

  catalog = load_clinic_catalog_bundle(clinic_row)
  clinic_title = str(clinic_row["name"])

  return jsonify(
    {
      "clinic": {
        "id": clinic_row["id"],
        "name": clinic_title,
        "shortName": build_clinic_short_name(clinic_title),
        "address": "",
        "openingHours": "Mo - Sa, 09:00 - 17:00",
        "phone": "",
        "city": "",
        "website": clinic_row["website"],
        "logoUrl": clinic_row["logo_url"],
        "brandColor": clinic_row["brand_color"],
        "accentColor": clinic_row["accent_color"],
      },
      "catalog": catalog,
      "fetchedAt": utc_now_iso(),
    }
  )


@app.get("/api/mobile/clinics/search")
def mobile_clinics_search():
  query = str(request.args.get("query", request.args.get("q", ""))).strip()
  try:
    limit = int(request.args.get("limit", "10"))
  except ValueError:
    limit = 10
  clinics = search_clinics_for_mobile(query, limit)
  return jsonify(
    {
      "clinics": clinics,
      "count": len(clinics),
      "query": query,
    }
  )


@app.post("/api/mobile/clinics/resolve-code")
def mobile_clinics_resolve_code():
  payload = request.get_json(silent=True) or {}
  raw_code = str(payload.get("code", "")).strip()
  if len(raw_code) < 1:
    return jsonify({"error": "code ist erforderlich."}), 400

  clinic_row = resolve_clinic_row_from_mobile_code(raw_code)
  if not clinic_row:
    return jsonify({"error": "Klinik-Code konnte nicht aufgelöst werden."}), 404

  return jsonify(
    {
      "success": True,
      "clinic": serialize_public_clinic(clinic_row),
      "resolvedClinicName": str(clinic_row["name"] or ""),
    }
  )


@app.post("/api/mobile/auth/otp/request")
def mobile_auth_otp_request():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  phone_e164 = sanitize_phone_e164(payload.get("phone"))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not phone_e164:
    return jsonify({"error": "Bitte gib eine gültige Telefonnummer im internationalen Format an."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  clinic_id = int(clinic_row["id"])
  response_payload, status_code = issue_mobile_phone_otp(clinic_id, phone_e164)
  return jsonify(response_payload), status_code


@app.post("/api/mobile/auth/otp/resend")
def mobile_auth_otp_resend():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  phone_e164 = sanitize_phone_e164(payload.get("phone"))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not phone_e164:
    return jsonify({"error": "Bitte gib eine gültige Telefonnummer im internationalen Format an."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  response_payload, status_code = issue_mobile_phone_otp(int(clinic_row["id"]), phone_e164)
  return jsonify(response_payload), status_code


@app.post("/api/mobile/auth/otp/verify")
def mobile_auth_otp_verify():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  phone_e164 = sanitize_phone_e164(payload.get("phone"))
  request_id = str(payload.get("requestId", "")).strip()
  code = normalize_mobile_otp_code(payload.get("code"))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not phone_e164:
    return jsonify({"error": "Bitte gib eine gültige Telefonnummer an."}), 400
  if len(request_id) < 8:
    return jsonify({"error": "requestId fehlt oder ist ungültig."}), 400
  if len(code) != MOBILE_OTP_LENGTH:
    return jsonify(
      mobile_otp_error_payload(
        f"Bitte gib den {MOBILE_OTP_LENGTH}-stelligen Code ein.",
        "OTP_INVALID",
      )
    ), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  clinic_id = int(clinic_row["id"])
  now = utc_now()
  with get_db() as conn:
    otp_row = conn.execute(
      """
      SELECT
        id,
        request_id,
        code_hash,
        attempt_count,
        max_attempts,
        expires_at,
        verified_at
      FROM mobile_phone_otps
      WHERE clinic_id = ? AND phone_e164 = ? AND request_id = ?
      LIMIT 1
      """,
      (clinic_id, phone_e164, request_id),
    ).fetchone()

    if not otp_row:
      return jsonify(
        mobile_otp_error_payload(
          "Kein OTP-Request gefunden. Bitte fordere einen neuen Code an.",
          "OTP_REQUEST_NOT_FOUND",
        )
      ), 404

    if str(otp_row["verified_at"] or "").strip():
      return jsonify(
        mobile_otp_error_payload(
          "Dieser Code wurde bereits verwendet. Bitte fordere einen neuen an.",
          "OTP_REQUEST_NOT_FOUND",
        )
      ), 409

    expires_at = parse_datetime_utc(otp_row["expires_at"])
    if expires_at is None or expires_at <= now:
      return jsonify(
        mobile_otp_error_payload(
          "Der Code ist abgelaufen. Bitte fordere einen neuen an.",
          "OTP_EXPIRED",
        )
      ), 410

    attempts = int(otp_row["attempt_count"] or 0)
    max_attempts = max(1, int(otp_row["max_attempts"] or MOBILE_OTP_MAX_ATTEMPTS))
    if attempts >= max_attempts:
      return jsonify(
        mobile_otp_error_payload(
          "Zu viele Fehlversuche. Bitte fordere einen neuen Code an.",
          "OTP_ATTEMPTS_EXCEEDED",
          attemptsRemaining=0,
        )
      ), 429

    expected_hash = hash_mobile_otp_code(request_id, code)
    if not hmac.compare_digest(expected_hash, str(otp_row["code_hash"] or "")):
      next_attempt_count = attempts + 1
      remaining = max(0, max_attempts - next_attempt_count)
      conn.execute(
        "UPDATE mobile_phone_otps SET attempt_count = attempt_count + 1 WHERE id = ?",
        (otp_row["id"],),
      )
      if remaining <= 0:
        return jsonify(
          mobile_otp_error_payload(
            "Zu viele Fehlversuche. Bitte fordere einen neuen Code an.",
            "OTP_ATTEMPTS_EXCEEDED",
            attemptsRemaining=0,
          )
        ), 429
      return jsonify(
        mobile_otp_error_payload(
          "Code ungültig.",
          "OTP_INVALID",
          attemptsRemaining=remaining,
        )
      ), 401

    conn.execute(
      """
      UPDATE mobile_phone_otps
      SET verified_at = ?
      WHERE id = ?
      """,
      (utc_now_iso(), otp_row["id"]),
    )

  member_email = mobile_member_email_for_phone(clinic_id, phone_e164)
  member_name = mobile_member_name_for_phone(phone_e164)
  return jsonify(
    {
      "success": True,
      "memberEmail": member_email,
      "memberName": member_name,
      "clinicName": str(clinic_row["name"] or clinic_name),
      "phone": phone_e164,
      "isGuest": False,
    }
  )


@app.get("/api/mobile/membership/status")
def mobile_membership_status():
  clinic_name = str(request.args.get("clinicName", "")).strip()
  patient_email = sanitize_patient_email(
    request.args.get("memberEmail", request.args.get("email", ""))
  )

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not patient_email:
    return jsonify({"error": "memberEmail ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  membership_row = get_patient_membership_row(int(clinic_row["id"]), patient_email)
  if not membership_row:
    return jsonify({"membership": None})

  membership_row = synchronize_patient_membership_row(clinic_row, membership_row)
  return jsonify({"membership": serialize_patient_membership_row(membership_row)})


@app.post("/api/mobile/membership/activate")
def mobile_membership_activate():
  payload = request.get_json(silent=True) or {}

  clinic_name = str(payload.get("clinicName", "")).strip()
  patient_email = sanitize_patient_email(payload.get("memberEmail") or payload.get("email"))
  patient_name = sanitize_patient_name(payload.get("memberName") or payload.get("name"))
  membership_id = str(payload.get("membershipId", "")).strip()
  payment_status = normalize_patient_payment_status(payload.get("paymentStatus"), "paid")

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not patient_email:
    return jsonify({"error": "memberEmail ist erforderlich."}), 400
  if len(membership_id) < 1:
    return jsonify({"error": "membershipId ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  membership_plan = resolve_catalog_membership_plan(clinic_row, membership_id)
  if not membership_plan:
    return jsonify({"error": "Membership im Katalog nicht gefunden."}), 404

  membership_row = activate_patient_membership(
    clinic_row=clinic_row,
    patient_email=patient_email,
    patient_name=patient_name,
    membership_plan=membership_plan,
    payment_status=payment_status,
  )
  if not membership_row:
    return jsonify({"error": "Membership konnte nicht aktiviert werden."}), 400

  create_analytics_event(
    clinic_id=int(clinic_row["id"]),
    user_id=None,
    event_name="membership_join",
    treatment_id=membership_id,
    amount_cents=int(membership_row["monthly_amount_cents"] or 0),
    metadata={
      "patientEmail": patient_email,
      "membershipId": membership_id,
      "membershipName": str(membership_row["membership_name"] or membership_id),
    },
    event_source="patient_app",
  )

  create_audit_log(
    clinic_id=int(clinic_row["id"]),
    actor_user_id=None,
    action="membership.activated",
    entity_type="patient_membership",
    entity_id=str(membership_row["id"]),
    metadata={
      "patientEmail": patient_email,
      "membershipId": membership_id,
      "paymentStatus": payment_status,
    },
  )

  membership_row = synchronize_patient_membership_row(clinic_row, membership_row)
  return jsonify(
    {
      "success": True,
      "membership": serialize_patient_membership_row(membership_row),
    }
  )


@app.post("/api/mobile/membership/cancel")
def mobile_membership_cancel():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  patient_email = sanitize_patient_email(payload.get("memberEmail") or payload.get("email"))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not patient_email:
    return jsonify({"error": "memberEmail ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  membership_row = update_patient_membership_status(
    clinic_id=int(clinic_row["id"]),
    patient_email=patient_email,
    status="canceled",
    payment_status="canceled",
  )
  if not membership_row:
    return jsonify({"error": "Keine Membership für diese E-Mail gefunden."}), 404

  create_audit_log(
    clinic_id=int(clinic_row["id"]),
    actor_user_id=None,
    action="membership.canceled",
    entity_type="patient_membership",
    entity_id=str(membership_row["id"]),
    metadata={"patientEmail": patient_email},
  )

  return jsonify(
    {
      "success": True,
      "membership": serialize_patient_membership_row(membership_row),
    }
  )


@app.post("/api/mobile/membership/mark-past-due")
def mobile_membership_mark_past_due():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  patient_email = sanitize_patient_email(payload.get("memberEmail") or payload.get("email"))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not patient_email:
    return jsonify({"error": "memberEmail ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  membership_row = update_patient_membership_status(
    clinic_id=int(clinic_row["id"]),
    patient_email=patient_email,
    status="past_due",
    payment_status="failed",
  )
  if not membership_row:
    return jsonify({"error": "Keine Membership für diese E-Mail gefunden."}), 404

  create_audit_log(
    clinic_id=int(clinic_row["id"]),
    actor_user_id=None,
    action="membership.marked_past_due",
    entity_type="patient_membership",
    entity_id=str(membership_row["id"]),
    metadata={"patientEmail": patient_email},
  )

  return jsonify(
    {
      "success": True,
      "membership": serialize_patient_membership_row(membership_row),
    }
  )


@app.post("/api/mobile/cart/add")
def mobile_cart_add():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  treatment_id = str(payload.get("treatmentId", "")).strip()
  patient_email = sanitize_patient_email(payload.get("memberEmail") or payload.get("email"))
  session_id = sanitize_campaign_text(payload.get("sessionId"), 120)
  units = parse_amount_cents(payload.get("units"))
  if units is None:
    units = 1
  units = max(1, min(units, 20))

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not treatment_id:
    return jsonify({"error": "treatmentId ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  catalog = load_clinic_catalog_bundle(clinic_row)
  treatment = resolve_catalog_treatment(catalog, treatment_id)
  if not treatment:
    return jsonify({"error": "Treatment nicht gefunden."}), 404

  membership_row = None
  if patient_email:
    membership_row = get_patient_membership_row(int(clinic_row["id"]), patient_email)
    membership_row = synchronize_patient_membership_row(clinic_row, membership_row)

  pricing = membership_pricing_for_treatment(clinic_row, treatment, membership_row)
  unit_price_cents = int(pricing["unitPriceCents"] or 0)
  total_cents = max(0, unit_price_cents * units)

  create_analytics_event(
    clinic_id=int(clinic_row["id"]),
    user_id=None,
    event_name="add_to_cart",
    treatment_id=treatment_id,
    amount_cents=total_cents,
    metadata={
      "sessionId": session_id,
      "patientEmail": patient_email,
      "units": units,
      "unitPriceCents": unit_price_cents,
      "priceSource": pricing["priceSource"],
      "membershipStatus": pricing["membershipStatus"],
      "membershipId": pricing["membershipId"],
    },
    event_source="patient_app_checkout",
  )

  return jsonify(
    {
      "success": True,
      "lineItem": {
        "id": f"{treatment_id}:{int(datetime.now().timestamp())}",
        "treatmentId": treatment_id,
        "name": str(treatment.get("name") or treatment_id),
        "units": units,
        "unitCents": unit_price_cents,
        "totalCents": total_cents,
        "priceSource": pricing["priceSource"],
      },
      "membership": serialize_patient_membership_row(membership_row) if membership_row else None,
      "pricing": pricing,
    }
  )


@app.post("/api/mobile/checkout/complete")
def mobile_checkout_complete():
  payload = request.get_json(silent=True) or {}
  clinic_name = str(payload.get("clinicName", "")).strip()
  patient_email = sanitize_patient_email(payload.get("memberEmail") or payload.get("email"))
  session_id = sanitize_campaign_text(payload.get("sessionId"), 120)
  payment_status = normalize_patient_payment_status(payload.get("paymentStatus"), "paid")
  raw_items = payload.get("cartItems")

  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400
  if not isinstance(raw_items, list) or not raw_items:
    return jsonify({"error": "cartItems ist erforderlich."}), 400
  if len(raw_items) > 50:
    return jsonify({"error": "Zu viele cartItems."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  catalog = load_clinic_catalog_bundle(clinic_row)
  membership_row = None
  if patient_email:
    membership_row = get_patient_membership_row(int(clinic_row["id"]), patient_email)
    membership_row = synchronize_patient_membership_row(clinic_row, membership_row)

  line_items: list[dict] = []
  total_cents = 0
  for entry in raw_items:
    if not isinstance(entry, dict):
      continue
    treatment_id = str(entry.get("treatmentId") or entry.get("id") or "").strip()
    if not treatment_id:
      continue
    treatment = resolve_catalog_treatment(catalog, treatment_id)
    if not treatment:
      continue
    units = parse_amount_cents(entry.get("units"))
    if units is None:
      units = 1
    units = max(1, min(units, 20))
    pricing = membership_pricing_for_treatment(clinic_row, treatment, membership_row)
    unit_price_cents = int(pricing["unitPriceCents"] or 0)
    line_total_cents = max(0, unit_price_cents * units)
    total_cents += line_total_cents
    line_items.append(
      {
        "treatmentId": treatment_id,
        "name": str(treatment.get("name") or treatment_id),
        "units": units,
        "unitCents": unit_price_cents,
        "totalCents": line_total_cents,
        "priceSource": pricing["priceSource"],
      }
    )

  if not line_items:
    return jsonify({"error": "Keine gültigen cartItems gefunden."}), 400

  earned_points = max(0, int(round(total_cents / 100)))
  order_id = f"ord_{secrets.token_hex(6)}"

  create_analytics_event(
    clinic_id=int(clinic_row["id"]),
    user_id=None,
    event_name="purchase_success",
    treatment_id=sanitize_treatment_id(line_items[0].get("treatmentId")),
    amount_cents=total_cents,
    metadata={
      "sessionId": session_id,
      "patientEmail": patient_email,
      "itemCount": len(line_items),
      "earnedPoints": earned_points,
      "paymentStatus": payment_status,
      "orderId": order_id,
      "lineItems": line_items[:20],
    },
    event_source="patient_app_checkout",
  )

  create_audit_log(
    clinic_id=int(clinic_row["id"]),
    actor_user_id=None,
    action="mobile.checkout_completed",
    entity_type="checkout",
    entity_id=order_id,
    metadata={
      "patientEmail": patient_email,
      "totalCents": total_cents,
      "items": len(line_items),
      "paymentStatus": payment_status,
    },
  )

  updated_membership = membership_row
  if membership_row and patient_email:
    target_status = resolve_membership_status_for_payment(payment_status, membership_row["status"])
    updated_membership = update_patient_membership_status(
      clinic_id=int(clinic_row["id"]),
      patient_email=patient_email,
      status=target_status,
      payment_status=payment_status,
    )
    updated_membership = synchronize_patient_membership_row(clinic_row, updated_membership)

  return jsonify(
    {
      "success": True,
      "orderId": order_id,
      "totalCents": total_cents,
      "currency": "eur",
      "earnedPoints": earned_points,
      "lineItems": line_items,
      "membership": serialize_patient_membership_row(updated_membership) if updated_membership else None,
    }
  )


@app.get("/api/clinic/catalog")
def clinic_catalog():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  catalog = load_clinic_catalog_bundle(clinic_row)
  return jsonify({"catalog": catalog})


@app.put("/api/clinic/catalog")
def update_clinic_catalog():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}
  existing = load_clinic_catalog_bundle(clinic_row)

  def resolved_list(key: str, max_items: int):
    if key not in payload:
      return existing[key]
    candidate = payload.get(key)
    if not isinstance(candidate, list):
      raise ValueError(f"'{key}' muss ein Array sein.")
    if len(candidate) > max_items:
      raise ValueError(f"'{key}' enthält zu viele Einträge.")
    return candidate

  try:
    categories = resolved_list("categories", 20)
    treatments = resolved_list("treatments", 300)
    memberships = resolved_list("memberships", 40)
    reward_actions = resolved_list("rewardActions", 80)
    reward_redeems = resolved_list("rewardRedeems", 80)
    home_articles = resolved_list("homeArticles", 60)
  except ValueError as exc:
    return jsonify({"error": str(exc)}), 400

  with get_db() as conn:
    ensure_clinic_catalog_row(conn, clinic_id, str(clinic_row["name"]))
    conn.execute(
      """
      UPDATE clinic_catalogs
      SET
        categories_json = ?,
        treatments_json = ?,
        memberships_json = ?,
        reward_actions_json = ?,
        reward_redeems_json = ?,
        home_articles_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE clinic_id = ?
      """,
      (
        serialize_json_list(categories),
        serialize_json_list(treatments),
        serialize_json_list(memberships),
        serialize_json_list(reward_actions),
        serialize_json_list(reward_redeems),
        serialize_json_list(home_articles),
        clinic_id,
      ),
    )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="catalog.updated",
    entity_type="catalog",
    entity_id=str(clinic_id),
    metadata={
      "categories": len(categories),
      "treatments": len(treatments),
      "memberships": len(memberships),
      "rewardActions": len(reward_actions),
      "rewardRedeems": len(reward_redeems),
      "homeArticles": len(home_articles),
    },
  )

  return jsonify(
    {
      "success": True,
      "catalog": {
        "categories": categories,
        "treatments": treatments,
        "memberships": memberships,
        "rewardActions": reward_actions,
        "rewardRedeems": reward_redeems,
        "homeArticles": home_articles,
      },
    }
  )


@app.get("/api/clinic/catalog/export")
def export_clinic_catalog():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  catalog = load_clinic_catalog_bundle(clinic_row)
  return jsonify(
    {
      "clinicId": clinic_id,
      "clinicName": clinic_row["name"],
      "exportedAt": utc_now_iso(),
      "catalog": catalog,
    }
  )


@app.post("/api/clinic/catalog/import")
def import_clinic_catalog():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}
  incoming = payload.get("catalog", payload)
  if not isinstance(incoming, dict):
    return jsonify({"error": "catalog muss ein Objekt sein."}), 400

  existing = load_clinic_catalog_bundle(clinic_row)

  def resolved_list(key: str, max_items: int):
    if key not in incoming:
      return existing[key]
    candidate = incoming.get(key)
    if not isinstance(candidate, list):
      raise ValueError(f"'{key}' muss ein Array sein.")
    if len(candidate) > max_items:
      raise ValueError(f"'{key}' enthält zu viele Einträge.")
    return candidate

  try:
    categories = resolved_list("categories", 20)
    treatments = resolved_list("treatments", 300)
    memberships = resolved_list("memberships", 40)
    reward_actions = resolved_list("rewardActions", 80)
    reward_redeems = resolved_list("rewardRedeems", 80)
    home_articles = resolved_list("homeArticles", 60)
  except ValueError as exc:
    return jsonify({"error": str(exc)}), 400

  with get_db() as conn:
    ensure_clinic_catalog_row(conn, clinic_id, str(clinic_row["name"]))
    conn.execute(
      """
      UPDATE clinic_catalogs
      SET
        categories_json = ?,
        treatments_json = ?,
        memberships_json = ?,
        reward_actions_json = ?,
        reward_redeems_json = ?,
        home_articles_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE clinic_id = ?
      """,
      (
        serialize_json_list(categories),
        serialize_json_list(treatments),
        serialize_json_list(memberships),
        serialize_json_list(reward_actions),
        serialize_json_list(reward_redeems),
        serialize_json_list(home_articles),
        clinic_id,
      ),
    )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="catalog.imported",
    entity_type="catalog",
    entity_id=str(clinic_id),
    metadata={
      "categories": len(categories),
      "treatments": len(treatments),
      "memberships": len(memberships),
      "rewardActions": len(reward_actions),
      "rewardRedeems": len(reward_redeems),
      "homeArticles": len(home_articles),
    },
  )

  return jsonify(
    {
      "success": True,
      "catalog": {
        "categories": categories,
        "treatments": treatments,
        "memberships": memberships,
        "rewardActions": reward_actions,
        "rewardRedeems": reward_redeems,
        "homeArticles": home_articles,
      },
    }
  )


@app.post("/api/clinic/catalog/auto-gallery")
def clinic_catalog_auto_gallery():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}
  overwrite_existing = bool(payload.get("overwriteExisting"))

  current_catalog = load_clinic_catalog_bundle(clinic_row)
  updated_catalog = apply_auto_gallery_to_catalog(dict(current_catalog), overwrite_existing=overwrite_existing)

  categories = updated_catalog.get("categories", [])
  treatments = updated_catalog.get("treatments", [])
  memberships = updated_catalog.get("memberships", [])
  reward_actions = updated_catalog.get("rewardActions", [])
  reward_redeems = updated_catalog.get("rewardRedeems", [])
  home_articles = updated_catalog.get("homeArticles", [])

  with get_db() as conn:
    ensure_clinic_catalog_row(conn, clinic_id, str(clinic_row["name"]))
    conn.execute(
      """
      UPDATE clinic_catalogs
      SET
        categories_json = ?,
        treatments_json = ?,
        memberships_json = ?,
        reward_actions_json = ?,
        reward_redeems_json = ?,
        home_articles_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE clinic_id = ?
      """,
      (
        serialize_json_list(categories),
        serialize_json_list(treatments),
        serialize_json_list(memberships),
        serialize_json_list(reward_actions),
        serialize_json_list(reward_redeems),
        serialize_json_list(home_articles),
        clinic_id,
      ),
    )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="catalog.auto_gallery",
    entity_type="catalog",
    entity_id=str(clinic_id),
    metadata={
      "overwriteExisting": overwrite_existing,
      "treatments": len(treatments),
    },
  )

  return jsonify(
    {
      "success": True,
      "catalog": updated_catalog,
    }
  )


@app.get("/api/clinic/campaigns")
def clinic_campaigns():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"campaigns": []})

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE clinic_id = ?
      ORDER BY updated_at DESC, id DESC
      """,
      (clinic_id,),
    ).fetchall()

  return jsonify(
    {
      "campaigns": [serialize_campaign_row(row) for row in rows],
      "options": {
        "triggers": sorted(CAMPAIGN_TRIGGER_CHOICES),
        "channels": sorted(CAMPAIGN_CHANNEL_CHOICES),
        "statuses": sorted(CAMPAIGN_STATUS_CHOICES),
      },
    }
  )


@app.post("/api/clinic/campaigns")
def create_clinic_campaign():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  payload = request.get_json(silent=True) or {}
  name = sanitize_campaign_text(payload.get("name"), 120)
  trigger_type = normalize_campaign_trigger(payload.get("triggerType"), "broadcast")
  channel = normalize_campaign_channel(payload.get("channel"), "in_app")
  status = normalize_campaign_status(payload.get("status"), "draft")
  template_title = sanitize_campaign_text(payload.get("templateTitle"), 180)
  template_body = sanitize_campaign_text(payload.get("templateBody"), 3000)

  points_bonus = parse_amount_cents(payload.get("pointsBonus"))
  if points_bonus is None:
    points_bonus = 0
  points_bonus = min(points_bonus, 100000)

  if len(name) < 2:
    return jsonify({"error": "Kampagnenname ist erforderlich."}), 400

  with get_db() as conn:
    campaign_id = insert_and_get_id(
      conn,
      """
      INSERT INTO clinic_campaigns (
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        created_by_user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        int(user_row["id"]),
      ),
    )
    campaign_row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE id = ?
      LIMIT 1
      """,
      (campaign_id,),
    ).fetchone()

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="campaign.created",
    entity_type="campaign",
    entity_id=str(campaign_id),
    metadata={"name": name, "triggerType": trigger_type, "channel": channel},
  )

  return jsonify({"campaign": serialize_campaign_row(campaign_row)}), 201


@app.put("/api/clinic/campaigns/<int:campaign_id>")
def update_clinic_campaign(campaign_id: int):
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  payload = request.get_json(silent=True) or {}

  with get_db() as conn:
    existing = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE id = ? AND clinic_id = ?
      LIMIT 1
      """,
      (campaign_id, clinic_id),
    ).fetchone()

    if not existing:
      return jsonify({"error": "Kampagne nicht gefunden."}), 404

    name = sanitize_campaign_text(payload.get("name", existing["name"]), 120)
    trigger_type = normalize_campaign_trigger(payload.get("triggerType", existing["trigger_type"]), existing["trigger_type"])
    channel = normalize_campaign_channel(payload.get("channel", existing["channel"]), existing["channel"])
    status = normalize_campaign_status(payload.get("status", existing["status"]), existing["status"])
    template_title = sanitize_campaign_text(payload.get("templateTitle", existing["template_title"]), 180)
    template_body = sanitize_campaign_text(payload.get("templateBody", existing["template_body"]), 3000)

    points_bonus = parse_amount_cents(payload.get("pointsBonus", existing["points_bonus"]))
    if points_bonus is None:
      return jsonify({"error": "pointsBonus ist ungültig."}), 400
    points_bonus = min(points_bonus, 100000)

    if len(name) < 2:
      return jsonify({"error": "Kampagnenname ist erforderlich."}), 400

    conn.execute(
      """
      UPDATE clinic_campaigns
      SET
        name = ?,
        trigger_type = ?,
        channel = ?,
        status = ?,
        template_title = ?,
        template_body = ?,
        points_bonus = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND clinic_id = ?
      """,
      (
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        campaign_id,
        clinic_id,
      ),
    )
    campaign_row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE id = ? AND clinic_id = ?
      LIMIT 1
      """,
      (campaign_id, clinic_id),
    ).fetchone()

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="campaign.updated",
    entity_type="campaign",
    entity_id=str(campaign_id),
    metadata={"status": status, "triggerType": trigger_type, "channel": channel},
  )

  return jsonify({"campaign": serialize_campaign_row(campaign_row)})


@app.post("/api/clinic/campaigns/<int:campaign_id>/run")
def run_clinic_campaign(campaign_id: int):
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  with get_db() as conn:
    campaign_row = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE id = ? AND clinic_id = ?
      LIMIT 1
      """,
      (campaign_id, clinic_id),
    ).fetchone()
    if not campaign_row:
      return jsonify({"error": "Kampagne nicht gefunden."}), 404

  run_result = run_campaign_once(
    campaign_row=campaign_row,
    actor_user_id=int(user_row["id"]),
    event_source="clinic_dashboard",
  )
  return jsonify(
    {
      "success": True,
      "campaign": run_result["campaign"],
      "run": run_result["run"],
    }
  )


def list_due_campaign_rows(clinic_id: int | None, limit: int) -> list:
  safe_limit = max(1, min(int(limit), 300))
  now_iso = utc_now_iso()
  with get_db() as conn:
    if clinic_id is None:
      return conn.execute(
        """
        SELECT
          id,
          clinic_id,
          name,
          trigger_type,
          channel,
          status,
          template_title,
          template_body,
          points_bonus,
          last_run_at,
          next_run_at,
          total_runs,
          total_audience,
          created_by_user_id,
          created_at,
          updated_at
        FROM clinic_campaigns
        WHERE status = 'active'
          AND next_run_at IS NOT NULL
          AND next_run_at <= ?
        ORDER BY next_run_at ASC, id ASC
        LIMIT ?
        """,
        (now_iso, safe_limit),
      ).fetchall()
    return conn.execute(
      """
      SELECT
        id,
        clinic_id,
        name,
        trigger_type,
        channel,
        status,
        template_title,
        template_body,
        points_bonus,
        last_run_at,
        next_run_at,
        total_runs,
        total_audience,
        created_by_user_id,
        created_at,
        updated_at
      FROM clinic_campaigns
      WHERE clinic_id = ?
        AND status = 'active'
        AND next_run_at IS NOT NULL
        AND next_run_at <= ?
      ORDER BY next_run_at ASC, id ASC
      LIMIT ?
      """,
      (clinic_id, now_iso, safe_limit),
    ).fetchall()


@app.post("/api/clinic/campaigns/run-due")
def run_due_campaigns_for_clinic():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  try:
    limit = int(request.args.get("limit", "25"))
  except ValueError:
    limit = 25
  due_rows = list_due_campaign_rows(clinic_id, limit)

  results = []
  for row in due_rows:
    run_result = run_campaign_once(
      campaign_row=row,
      actor_user_id=int(user_row["id"]),
      event_source="clinic_dashboard",
    )
    results.append(
      {
        "campaign": run_result["campaign"],
        "run": run_result["run"],
      }
    )

  return jsonify(
    {
      "success": True,
      "executed": len(results),
      "runs": results,
    }
  )


@app.post("/api/system/campaigns/run-due")
def run_due_campaigns_system():
  if not AUTOMATION_RUNNER_SECRET:
    return jsonify({"error": "AUTOMATION_RUNNER_SECRET ist nicht konfiguriert."}), 503

  provided_secret = str(
    request.headers.get("X-Automation-Secret")
    or request.args.get("secret")
    or ""
  ).strip()
  if not hmac.compare_digest(provided_secret, AUTOMATION_RUNNER_SECRET):
    return jsonify({"error": "Nicht autorisiert."}), 401

  try:
    limit = int(request.args.get("limit", "100"))
  except ValueError:
    limit = 100
  due_rows = list_due_campaign_rows(None, limit)

  results = []
  for row in due_rows:
    run_result = run_campaign_once(
      campaign_row=row,
      actor_user_id=None,
      event_source="system_automation",
    )
    results.append(
      {
        "campaign": run_result["campaign"],
        "run": run_result["run"],
      }
    )

  return jsonify(
    {
      "success": True,
      "executed": len(results),
      "runs": results,
      "fetchedAt": utc_now_iso(),
    }
  )


@app.get("/api/clinic/campaigns/<int:campaign_id>/deliveries")
def clinic_campaign_deliveries(campaign_id: int):
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"deliveries": []})

  try:
    limit = int(request.args.get("limit", "120"))
  except ValueError:
    limit = 120
  safe_limit = max(1, min(limit, 500))

  with get_db() as conn:
    campaign_row = conn.execute(
      """
      SELECT id
      FROM clinic_campaigns
      WHERE id = ? AND clinic_id = ?
      LIMIT 1
      """,
      (campaign_id, clinic_id),
    ).fetchone()
    if not campaign_row:
      return jsonify({"error": "Kampagne nicht gefunden."}), 404

    rows = conn.execute(
      """
      SELECT
        id,
        clinic_id,
        campaign_id,
        recipient_key,
        channel,
        status,
        provider_message_id,
        error_message,
        metadata_json,
        created_at
      FROM campaign_deliveries
      WHERE clinic_id = ? AND campaign_id = ?
      ORDER BY id DESC
      LIMIT ?
      """,
      (clinic_id, campaign_id, safe_limit),
    ).fetchall()

  deliveries = []
  for row in rows:
    deliveries.append(
      {
        "id": row["id"],
        "clinicId": row["clinic_id"],
        "campaignId": row["campaign_id"],
        "recipientKey": row["recipient_key"],
        "channel": row["channel"],
        "status": row["status"],
        "providerMessageId": row["provider_message_id"],
        "errorMessage": row["error_message"],
        "metadata": parse_event_metadata(row["metadata_json"]),
        "createdAt": row["created_at"],
      }
    )

  return jsonify({"deliveries": deliveries})


@app.get("/api/clinic/audit-logs")
def clinic_audit_logs():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"logs": []})

  try:
    limit = int(request.args.get("limit", "100"))
  except ValueError:
    limit = 100

  logs = list_clinic_audit_logs(clinic_id, limit)
  return jsonify({"logs": logs})


@app.get("/api/clinic/media")
def clinic_media_list():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"items": []})

  media_dir = clinic_upload_directory(clinic_id)
  items = []
  for path in media_dir.iterdir():
    if not path.is_file():
      continue
    if path.suffix.lower() not in ALLOWED_UPLOAD_IMAGE_EXTENSIONS:
      continue
    stat = path.stat()
    items.append(
      {
        "filename": path.name,
        "url": file_public_url(path),
        "sizeBytes": int(stat.st_size),
        "updatedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
      }
    )

  items.sort(key=lambda item: item["updatedAt"], reverse=True)
  return jsonify({"items": items})


@app.post("/api/clinic/media/upload")
def clinic_media_upload():
  owner_row, auth_error = require_owner_row()
  if not owner_row:
    return auth_error

  clinic_id = int(owner_row["clinic_id"]) if owner_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  upload = request.files.get("file")
  if upload is None:
    return jsonify({"error": "Bitte eine Bilddatei auswählen."}), 400

  original_name = secure_filename(upload.filename or "")
  if not original_name:
    return jsonify({"error": "Ungültiger Dateiname."}), 400
  if not is_allowed_image_filename(original_name):
    return jsonify({"error": "Nur PNG, JPG, JPEG, WEBP oder GIF erlaubt."}), 400

  upload.stream.seek(0, os.SEEK_END)
  file_size = upload.stream.tell()
  upload.stream.seek(0)
  if file_size > MAX_IMAGE_UPLOAD_BYTES:
    max_mb = MAX_IMAGE_UPLOAD_BYTES // (1024 * 1024)
    return jsonify({"error": f"Datei zu groß. Maximal {max_mb} MB."}), 413

  ext = Path(original_name).suffix.lower()
  unique_name = f"{int(utc_now().timestamp())}_{secrets.token_hex(6)}{ext}"
  media_dir = clinic_upload_directory(clinic_id)
  target_path = media_dir / unique_name
  upload.save(target_path)

  relative_url = file_public_url(target_path)
  absolute_url = request.host_url.rstrip("/") + relative_url

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(owner_row["id"]),
    action="media.uploaded",
    entity_type="media",
    entity_id=unique_name,
    metadata={"sizeBytes": int(file_size), "url": relative_url},
  )

  return jsonify(
    {
      "success": True,
      "file": {
        "filename": unique_name,
        "url": relative_url,
        "absoluteUrl": absolute_url,
        "sizeBytes": int(file_size),
      },
    }
  ), 201


@app.delete("/api/clinic/media")
def clinic_media_delete():
  owner_row, auth_error = require_owner_row()
  if not owner_row:
    return auth_error

  clinic_id = int(owner_row["clinic_id"]) if owner_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  payload = request.get_json(silent=True) or {}
  filename = secure_filename(str(payload.get("filename", "")).strip())
  if not filename:
    return jsonify({"error": "Bitte Dateiname angeben."}), 400

  media_dir = clinic_upload_directory(clinic_id)
  target_path = media_dir / filename
  if not target_path.exists() or not target_path.is_file():
    return jsonify({"error": "Datei nicht gefunden."}), 404

  target_path.unlink()
  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(owner_row["id"]),
    action="media.deleted",
    entity_type="media",
    entity_id=filename,
  )
  return jsonify({"success": True})


@app.get("/api/clinic/settings")
def clinic_settings():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_row = get_clinic_row_by_id(int(user_row["clinic_id"])) if user_row["clinic_id"] else None
  if clinic_row:
    settings_payload = {
      "clinicName": clinic_row["name"],
      "website": clinic_row["website"],
      "logoUrl": clinic_row["logo_url"],
      "brandColor": clinic_row["brand_color"],
      "accentColor": clinic_row["accent_color"],
      "fontFamily": clinic_row["font_family"],
      "designPreset": clinic_row["design_preset"],
      "calendlyUrl": clinic_row["calendly_url"],
    }
  else:
    settings_payload = {
      "clinicName": user_row["clinic_name"],
      "website": user_row["website"],
      "logoUrl": user_row["logo_url"],
      "brandColor": user_row["brand_color"],
      "accentColor": user_row["accent_color"],
      "fontFamily": user_row["font_family"],
      "designPreset": user_row["design_preset"],
      "calendlyUrl": user_row["calendly_url"],
    }

  return jsonify(
    {
      "settings": settings_payload,
      "permissions": {
        "role": user_row["role"],
        "isOwner": str(user_row["role"]) == "owner",
      },
    }
  )


@app.put("/api/clinic/settings")
def update_clinic_settings():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}

  clinic_name = str(payload.get("clinicName", clinic_row["name"])).strip()
  website = normalize_url(str(payload.get("website", clinic_row["website"])))
  logo_url = normalize_url(str(payload.get("logoUrl", clinic_row["logo_url"])))
  brand_color = to_hex_color(str(payload.get("brandColor", clinic_row["brand_color"])), clinic_row["brand_color"])
  accent_color = to_hex_color(str(payload.get("accentColor", clinic_row["accent_color"])), clinic_row["accent_color"])
  font_family = str(payload.get("fontFamily", clinic_row["font_family"])).strip()
  design_preset = str(payload.get("designPreset", clinic_row["design_preset"])).strip().lower()
  calendly_url = normalize_url(str(payload.get("calendlyUrl", clinic_row["calendly_url"] or CALENDLY_URL)))

  if not clinic_name:
    return jsonify({"error": "Klinikname ist erforderlich."}), 400
  if design_preset not in DESIGN_PRESETS:
    return jsonify({"error": "Ungültiges Design-Preset."}), 400
  if len(font_family) > 120:
    return jsonify({"error": "Schriftart ist zu lang."}), 400

  with get_db() as conn:
    conn.execute(
      """
      UPDATE clinics
      SET
        name = ?,
        website = ?,
        logo_url = ?,
        brand_color = ?,
        accent_color = ?,
        font_family = ?,
        design_preset = ?,
        calendly_url = ?
      WHERE id = ?
      """,
      (
        clinic_name,
        website,
        logo_url,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        clinic_id,
      ),
    )

    # Keep mirrored user fields in sync for existing clients.
    conn.execute(
      """
      UPDATE users
      SET
        clinic_name = ?,
        website = ?,
        logo_url = ?,
        brand_color = ?,
        accent_color = ?,
        font_family = ?,
        design_preset = ?,
        calendly_url = ?
      WHERE clinic_id = ?
      """,
      (
        clinic_name,
        website,
        logo_url,
        brand_color,
        accent_color,
        font_family,
        design_preset,
        calendly_url,
        clinic_id,
      ),
    )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="clinic.settings_updated",
    entity_type="clinic",
    entity_id=str(clinic_id),
    metadata={
      "clinicName": clinic_name,
      "brandColor": brand_color,
      "accentColor": accent_color,
      "designPreset": design_preset,
    },
  )

  return jsonify(
    {
      "settings": {
        "clinicName": clinic_name,
        "website": website,
        "logoUrl": logo_url,
        "brandColor": brand_color,
        "accentColor": accent_color,
        "fontFamily": font_family,
        "designPreset": design_preset,
        "calendlyUrl": calendly_url,
      }
    }
  )


@app.get("/api/clinic/members")
def clinic_members():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"members": []})

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        id,
        email,
        full_name,
        role,
        created_at
      FROM users
      WHERE clinic_id = ?
      ORDER BY created_at ASC
      """,
      (clinic_id,),
    ).fetchall()

  return jsonify(
    {
      "members": [
        {
          "id": row["id"],
          "email": row["email"],
          "fullName": row["full_name"],
          "role": row["role"],
          "createdAt": row["created_at"],
        }
        for row in rows
      ]
    }
  )


@app.get("/api/clinic/patient-memberships")
def clinic_patient_memberships():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"summary": summarize_patient_memberships([]), "memberships": []})

  try:
    limit = int(request.args.get("limit", "200"))
  except ValueError:
    limit = 200

  rows = list_patient_memberships_by_clinic(clinic_id, limit)
  summary = summarize_patient_memberships(rows)

  return jsonify(
    {
      "summary": summary,
      "memberships": [serialize_patient_membership_row(row) for row in rows],
    }
  )


@app.post("/api/clinic/members")
def create_clinic_member():
  owner_row, auth_error = require_owner_row()
  if not owner_row:
    return auth_error

  clinic_id = int(owner_row["clinic_id"]) if owner_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  clinic_row = get_clinic_row_by_id(clinic_id)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  payload = request.get_json(silent=True) or {}
  full_name = str(payload.get("fullName", "")).strip()
  email = str(payload.get("email", "")).strip().lower()
  password = str(payload.get("password", ""))
  role = str(payload.get("role", "staff")).strip().lower()

  if role != "staff":
    return jsonify({"error": "Für neue Mitglieder ist nur die Rolle staff erlaubt."}), 400
  if len(full_name) < 2:
    return jsonify({"error": "Name ist erforderlich."}), 400
  if "@" not in email or "." not in email:
    return jsonify({"error": "Bitte gültige E-Mail eingeben."}), 400
  if len(password) < 8:
    return jsonify({"error": "Passwort muss mindestens 8 Zeichen haben."}), 400

  password_hash = generate_password_hash(password, method="pbkdf2:sha256")

  try:
    with get_db() as conn:
      member_id = insert_and_get_id(
        conn,
        """
        INSERT INTO users (
          clinic_id,
          role,
          email,
          password_hash,
          full_name,
          clinic_name,
          logo_url,
          website,
          brand_color,
          accent_color,
          font_family,
          design_preset,
          calendly_url,
          subscription_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive')
        """,
        (
          clinic_id,
          role,
          email,
          password_hash,
          full_name,
          clinic_row["name"],
          clinic_row["logo_url"],
          clinic_row["website"],
          clinic_row["brand_color"],
          clinic_row["accent_color"],
          clinic_row["font_family"],
          clinic_row["design_preset"],
          clinic_row["calendly_url"],
        ),
      )

      member_row = conn.execute(
        """
        SELECT
          id,
          email,
          full_name,
          role,
          created_at
        FROM users
        WHERE id = ?
        """,
        (member_id,),
      ).fetchone()
  except Exception as exc:
    if is_unique_violation(exc):
      return jsonify({"error": "Diese E-Mail ist bereits registriert."}), 409
    raise

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(owner_row["id"]),
    action="member.created",
    entity_type="user",
    entity_id=str(member_row["id"]),
    metadata={"email": member_row["email"], "role": member_row["role"]},
  )

  return jsonify(
    {
      "member": {
        "id": member_row["id"],
        "email": member_row["email"],
        "fullName": member_row["full_name"],
        "role": member_row["role"],
        "createdAt": member_row["created_at"],
      }
    }
  ), 201


@app.post("/api/analytics/events")
def create_analytics_event_authenticated():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  payload = request.get_json(silent=True) or {}
  event_name = normalize_event_name(payload.get("eventName"))
  if not event_name:
    return jsonify({"error": "Ungültiger Event-Name."}), 400

  treatment_id = sanitize_treatment_id(payload.get("treatmentId"))
  amount_cents = parse_amount_cents(payload.get("amountCents"))
  metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}

  event_id = create_analytics_event(
    clinic_id=clinic_id,
    user_id=int(user_row["id"]),
    event_name=event_name,
    treatment_id=treatment_id or None,
    amount_cents=amount_cents,
    metadata=metadata,
    event_source="clinic_dashboard",
  )

  return jsonify({"success": True, "eventId": event_id}), 201


@app.post("/api/analytics/public-event")
def create_analytics_event_public():
  payload = request.get_json(silent=True) or {}

  clinic_name = str(payload.get("clinicName", "")).strip()
  if len(clinic_name) < 2:
    return jsonify({"error": "clinicName ist erforderlich."}), 400

  clinic_row = get_clinic_row_by_name(clinic_name)
  if not clinic_row:
    return jsonify({"error": "Klinik nicht gefunden."}), 404

  event_name = normalize_event_name(payload.get("eventName"))
  if not event_name:
    return jsonify({"error": "Ungültiger Event-Name."}), 400

  treatment_id = sanitize_treatment_id(payload.get("treatmentId") or payload.get("treatmentName"))
  amount_cents = parse_amount_cents(payload.get("amountCents"))

  metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
  metadata = {
    **metadata,
    "sessionId": str(payload.get("sessionId") or metadata.get("sessionId") or "").strip(),
    "patientId": str(payload.get("patientId") or metadata.get("patientId") or "").strip(),
  }

  event_id = create_analytics_event(
    clinic_id=int(clinic_row["id"]),
    user_id=None,
    event_name=event_name,
    treatment_id=treatment_id or None,
    amount_cents=amount_cents,
    metadata=metadata,
    event_source="patient_app",
  )

  return jsonify({"success": True, "eventId": event_id}), 201


@app.get("/api/analytics/summary")
def clinic_analytics_summary():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  raw_from = str(request.args.get("from", "") or "").strip()
  raw_to = str(request.args.get("to", "") or "").strip()
  use_custom_range = bool(raw_from or raw_to)

  days, is_all_time = parse_analytics_days(request.args.get("days", "30"))
  custom_from: datetime | None = None
  custom_to: datetime | None = None

  if use_custom_range:
    if not raw_from or not raw_to:
      return jsonify({"error": "Bitte sowohl 'from' als auch 'to' angeben."}), 400
    custom_from = parse_analytics_range_datetime(raw_from, end_of_day=False)
    custom_to = parse_analytics_range_datetime(raw_to, end_of_day=True)
    if custom_from is None or custom_to is None:
      return jsonify({"error": "Ungültiges Datumsformat. Verwende YYYY-MM-DD."}), 400
    if custom_from >= custom_to:
      return jsonify({"error": "'from' muss vor 'to' liegen."}), 400
    duration_seconds = max(1, int((custom_to - custom_from).total_seconds()))
    days = max(1, min((duration_seconds + 86399) // 86400, 3650))
    is_all_time = False

  compare_mode = str(request.args.get("compare", "none")).strip().lower()
  if compare_mode not in {"none", "prev", "yoy"}:
    compare_mode = "none"
  if is_all_time and not use_custom_range and compare_mode != "none":
    compare_mode = "none"

  if use_custom_range and custom_from is not None and custom_to is not None:
    result = build_clinic_analytics_summary(
      clinic_id,
      days,
      window_end=custom_to,
      window_start=custom_from,
    )
  else:
    result = build_clinic_analytics_summary(clinic_id, days)

  baseline_result = None
  if compare_mode == "prev":
    if use_custom_range and custom_from is not None and custom_to is not None:
      baseline_end = custom_from
      baseline_start = baseline_end - (custom_to - custom_from)
      baseline_result = build_clinic_analytics_summary(
        clinic_id,
        days,
        window_end=baseline_end,
        window_start=baseline_start,
      )
    else:
      current_from = parse_datetime_utc((result.get("window") or {}).get("from"))
      if current_from is not None:
        baseline_result = build_clinic_analytics_summary(clinic_id, days, window_end=current_from)
  elif compare_mode == "yoy":
    if use_custom_range and custom_from is not None and custom_to is not None:
      baseline_result = build_clinic_analytics_summary(
        clinic_id,
        days,
        window_start=custom_from - timedelta(days=365),
        window_end=custom_to - timedelta(days=365),
      )
    else:
      current_to = parse_datetime_utc((result.get("window") or {}).get("to"))
      if current_to is not None:
        baseline_result = build_clinic_analytics_summary(
          clinic_id,
          days,
          window_end=current_to - timedelta(days=365),
        )

  result["comparison"] = build_analytics_comparison_payload(result, baseline_result, compare_mode)
  if baseline_result is not None:
    result["baseline"] = {
      "window": baseline_result.get("window") or {},
      "summary": baseline_result.get("summary") or {},
    }
  result["period"] = {
    "days": days,
    "isAllTime": is_all_time,
    "isCustomRange": use_custom_range,
    "from": raw_from if use_custom_range else None,
    "to": raw_to if use_custom_range else None,
  }
  return jsonify(result)


@app.get("/api/billing/status")
def billing_status():
  user_row, auth_error = require_auth_row()
  if not user_row:
    return auth_error

  clinic_row = get_clinic_row_by_id(int(user_row["clinic_id"])) if user_row["clinic_id"] else None

  with get_db() as conn:
    row = conn.execute(
      """
      SELECT
        stripe_subscription_id,
        plan_name,
        amount_cents,
        currency,
        status,
        current_period_end,
        created_at,
        updated_at
      FROM subscriptions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
      """,
      (user_row["id"],),
    ).fetchone()

  if row:
    status = map_stripe_subscription_status(row["status"], fallback="inactive")
    plan_name = row["plan_name"]
    amount_cents = row["amount_cents"]
    currency = row["currency"]
    current_period_end = row["current_period_end"]
    stripe_subscription_id = row["stripe_subscription_id"]
  else:
    status = map_stripe_subscription_status(
      (clinic_row["subscription_status"] if clinic_row else user_row["subscription_status"]),
      fallback="inactive",
    )
    plan_name = APPOINTMENTIX_PLAN_NAME
    amount_cents = APPOINTMENTIX_MONTHLY_AMOUNT_CENTS
    currency = "eur"
    current_period_end = None
    stripe_subscription_id = (
      clinic_row["stripe_subscription_id"] if clinic_row else user_row["stripe_subscription_id"]
    )

  return jsonify(
    {
      "subscription": {
        "status": status,
        "planName": plan_name,
        "amountCents": amount_cents,
        "currency": currency,
        "currentPeriodEnd": current_period_end,
        "stripeSubscriptionId": stripe_subscription_id,
      },
      "canUsePlatform": status in {"active", "trialing"},
    }
  )


@app.get("/api/billing/history")
def billing_history():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT
        stripe_session_id,
        stripe_subscription_id,
        plan_name,
        amount_cents,
        currency,
        status,
        current_period_end,
        created_at,
        updated_at
      FROM subscriptions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 20
      """,
      (user_row["id"],),
    ).fetchall()

  return jsonify(
    {
      "subscriptions": [
        {
          "stripeSessionId": row["stripe_session_id"],
          "stripeSubscriptionId": row["stripe_subscription_id"],
          "planName": row["plan_name"],
          "amountCents": row["amount_cents"],
          "currency": row["currency"],
          "status": row["status"],
          "currentPeriodEnd": row["current_period_end"],
          "createdAt": row["created_at"],
          "updatedAt": row["updated_at"],
        }
        for row in rows
      ]
    }
  )


@app.post("/api/billing/create-checkout-session")
def create_clinic_checkout_session():
  user_row, auth_error = require_owner_row()
  if not user_row:
    return auth_error

  clinic_id = int(user_row["clinic_id"]) if user_row["clinic_id"] else None
  if clinic_id is None:
    return jsonify({"error": "Klinikzuordnung fehlt."}), 400

  if not stripe_runtime_ready():
    return jsonify({"error": "Stripe ist nicht vollständig konfiguriert."}), 503

  payload = request.get_json(silent=True) or {}

  if payload.get("monthlyAmountEur") is None:
    amount_cents = APPOINTMENTIX_MONTHLY_AMOUNT_CENTS
  else:
    amount_cents = parse_amount_to_cents(payload.get("monthlyAmountEur"))
    if amount_cents is None:
      return jsonify({"error": "Ungültiger Monatsbetrag."}), 400

  plan_name = str(payload.get("planName", APPOINTMENTIX_PLAN_NAME)).strip() or APPOINTMENTIX_PLAN_NAME
  if len(plan_name) > 120:
    return jsonify({"error": "Planname ist zu lang."}), 400

  base_url = request.host_url.rstrip("/")
  encoded_plan = quote_plus(plan_name)
  success_url = f"{base_url}/?billing=success&plan={encoded_plan}"
  cancel_url = f"{base_url}/?billing=cancel&plan={encoded_plan}"

  checkout_payload: dict = {
    "mode": "subscription",
    "line_items": [
      {
        "price_data": {
          "currency": "eur",
          "unit_amount": amount_cents,
          "recurring": {"interval": "month"},
          "product_data": {
            "name": plan_name,
            "description": "Monatlicher White-Label-Zugang für deine Klinik",
          },
        },
        "quantity": 1,
      }
    ],
    "success_url": success_url,
    "cancel_url": cancel_url,
    "allow_promotion_codes": True,
    "client_reference_id": str(user_row["id"]),
    "metadata": {
      "user_id": str(user_row["id"]),
      "plan_name": plan_name,
      "amount_cents": str(amount_cents),
    },
  }
  requested_payment_methods = parse_checkout_payment_method_types(
    payload.get("paymentMethodTypes") or STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES
  )
  if requested_payment_methods:
    checkout_payload["payment_method_types"] = requested_payment_methods

  stripe_customer_id = user_row["stripe_customer_id"]
  if stripe_customer_id:
    checkout_payload["customer"] = stripe_customer_id
  else:
    checkout_payload["customer_email"] = user_row["email"]

  checkout_warnings: list[str] = []
  configured_payment_methods = list(requested_payment_methods)

  def attempt_checkout(method_types: list[str] | None):
    payload_for_attempt = dict(checkout_payload)
    if method_types:
      payload_for_attempt["payment_method_types"] = method_types
    else:
      payload_for_attempt.pop("payment_method_types", None)
    return stripe.checkout.Session.create(**payload_for_attempt)

  try:
    checkout_session = attempt_checkout(requested_payment_methods or None)
  except Exception as exc:
    fallback_sequences: list[list[str] | None] = []
    if requested_payment_methods:
      fallback_sequences.append([method for method in requested_payment_methods if method != "klarna"])
      fallback_sequences.append([method for method in requested_payment_methods if method == "card"])
      fallback_sequences.append(None)

    checkout_session = None
    last_exc = exc
    for fallback_methods in fallback_sequences:
      if fallback_methods == requested_payment_methods:
        continue
      try:
        checkout_session = attempt_checkout(fallback_methods)
        configured_payment_methods = fallback_methods or []
        break
      except Exception as retry_exc:
        last_exc = retry_exc
        continue

    if checkout_session is None:
      return jsonify({"error": f"Stripe Checkout konnte nicht erstellt werden: {last_exc}"}), 502

    if requested_payment_methods and configured_payment_methods != requested_payment_methods:
      checkout_warnings.append(
        "Einige Payment-Methoden waren für dieses Stripe-Konto oder diesen Checkout nicht verfügbar. "
        "Checkout wurde mit den kompatiblen Methoden erstellt."
      )

  create_audit_log(
    clinic_id=clinic_id,
    actor_user_id=int(user_row["id"]),
    action="billing.checkout_started",
    entity_type="billing",
    entity_id=str(checkout_session.get("id") or ""),
    metadata={
      "planName": plan_name,
      "amountCents": amount_cents,
      "requestedPaymentMethods": requested_payment_methods,
      "configuredPaymentMethods": configured_payment_methods,
    },
  )

  return jsonify(
    {
      "sessionId": checkout_session.get("id"),
      "checkoutUrl": checkout_session.get("url"),
      "paymentMethodsRequested": requested_payment_methods,
      "paymentMethodsConfigured": configured_payment_methods,
      "applePayRequiresCard": "card" in configured_payment_methods or not configured_payment_methods,
      "warnings": checkout_warnings,
    }
  )


@app.post("/api/payments/webhook")
def stripe_webhook():
  if is_placeholder(STRIPE_WEBHOOK_SECRET):
    return jsonify({"error": "Webhook-Secret fehlt."}), 503

  payload = request.get_data()
  signature = request.headers.get("Stripe-Signature", "")

  try:
    event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
  except ValueError:
    return jsonify({"error": "Ungültiger Payload."}), 400
  except stripe.error.SignatureVerificationError:
    return jsonify({"error": "Ungültige Signatur."}), 400

  event_type = event.get("type")
  event_object = ((event.get("data") or {}).get("object") or {})

  if event_type == "checkout.session.completed":
    handle_checkout_session_completed(event_object)
  elif event_type == "checkout.session.async_payment_succeeded":
    handle_checkout_session_completed(event_object)
  elif event_type == "checkout.session.async_payment_failed":
    handle_invoice_event(event_object, default_status="past_due")

  if event_type in {
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  }:
    handle_subscription_changed(event_object)
  elif event_type == "invoice.paid":
    handle_invoice_event(event_object, default_status="active")
  elif event_type == "invoice.payment_failed":
    handle_invoice_event(event_object, default_status="past_due")

  return jsonify({"received": True})


@app.get("/<path:path>")
def serve_static(path: str):
  file_path = BASE_DIR / path
  if file_path.exists() and file_path.is_file():
    return send_from_directory(BASE_DIR, path)
  return send_from_directory(BASE_DIR, "index.html")


init_db()


if __name__ == "__main__":
  app.run(host="0.0.0.0", port=PORT, debug=os.getenv("FLASK_DEBUG", "0") == "1")
