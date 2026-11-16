
import json
from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {
    "id",
    "start_time",
    "calculated_end_time",
    "belt_test_updated_at",
    "student_name",
    "email",
    "squad_number",
    "initial_belt_levels",
    "final_belt_levels",
}

LANGUAGES = {
    "python": "Python",
    "nodejs": "Node.js",
    "java": "Java",
    "cpp": "C++",
}


def _first_valid_timestamp(*values):
    """
    Return the first parseable timestamp in priority order.

    An invalid non-empty preferred timestamp must not block fallback to
    calculatedEndTime or startTime.
    """
    for value in values:
        if value is None:
            continue

        candidate = str(value).strip()
        if not candidate:
            continue

        parsed = pd.to_datetime(candidate, errors="coerce", utc=True)
        if not pd.isna(parsed):
            return candidate

    return ""


def _parse_levels(value, column_name, row_number, require_all=False):
    """Parse and validate a JSON object containing belt levels."""
    try:
        levels = json.loads(value) if isinstance(value, str) else value
    except (json.JSONDecodeError, TypeError):
        raise ValueError(
            f"Invalid JSON in '{column_name}' at CSV row {row_number}."
        )

    if not isinstance(levels, dict):
        raise ValueError(
            f"'{column_name}' must contain a JSON object at CSV row {row_number}."
        )

    normalized = {}

    for key, language in LANGUAGES.items():
        raw_level = levels.get(key)

        if raw_level is None:
            if require_all:
                raise ValueError(
                    f"Missing '{key}' in '{column_name}' at CSV row {row_number}."
                )
            normalized[key] = 0
            continue

        if isinstance(raw_level, bool):
            raise ValueError(
                f"Invalid belt level for '{key}' at CSV row {row_number}."
            )

        try:
            numeric_level = int(raw_level)
        except (TypeError, ValueError):
            raise ValueError(
                f"Invalid belt level for '{key}' at CSV row {row_number}."
            )

        if numeric_level < 0 or str(numeric_level) != str(raw_level).strip():
            raise ValueError(
                f"Belt level for '{key}' must be a non-negative integer "
                f"at CSV row {row_number}."
            )

        normalized[key] = numeric_level

    return normalized


def process_belt_test_file(incoming_path, master_csv_path=None):
    """
    Validate and normalize a belt_test.csv upload.

    The master_csv_path argument is retained temporarily for compatibility
    with run_pipeline.py. It is intentionally not read or written.
    MongoDB will become the permanent record store.
    """
    file_path = Path(incoming_path)

    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    df = pd.read_csv(file_path, dtype=str, keep_default_na=False)
    df.columns = [str(column).strip().lower() for column in df.columns]

    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        raise ValueError(
            "Missing required belt-test columns: "
            + ", ".join(sorted(missing_columns))
        )

    if df.empty:
        raise ValueError("The uploaded belt-test CSV is empty.")

    records = []
    seen_ids = set()

    for index, row in df.iterrows():
        row_number = index + 2

        test_id = str(row["id"]).strip()
        student_name = str(row["student_name"]).strip()
        email = str(row["email"]).strip().lower()

        if not test_id:
            raise ValueError(f"Missing test ID at CSV row {row_number}.")

        if test_id in seen_ids:
            raise ValueError(
                f"Duplicate test ID '{test_id}' inside the uploaded CSV."
            )

        if not student_name:
            raise ValueError(f"Missing student name at CSV row {row_number}.")

        if not email or "@" not in email:
            raise ValueError(f"Invalid email at CSV row {row_number}.")

        initial_levels = _parse_levels(
            row["initial_belt_levels"],
            "initial_belt_levels",
            row_number,
        )

        final_levels = _parse_levels(
            row["final_belt_levels"],
            "final_belt_levels",
            row_number,
            require_all=True,
        )

        seen_ids.add(test_id)

        records.append({
            "testId": test_id,
            "startTime": str(row["start_time"]).strip(),
            "calculatedEndTime": str(row["calculated_end_time"]).strip(),
            "beltTestUpdatedAt": str(row["belt_test_updated_at"]).strip(),
            "studentName": student_name,
            "email": email,
            "squadNumber": str(row["squad_number"]).strip(),
            "initialBeltLevels": initial_levels,
            "finalBeltLevels": final_levels,
            "sourceFilename": file_path.name,
        })

    return {
        "records": records,
        "summary": {
            "sourceRecords": len(records),
        },
    }


def aggregate_records(records):
    """
    Rebuild dashboard-compatible student data from all stored belt-test records.
    Preserve the source squad number as the student's batch.
    """
    try:
        from .cleaner import aggregate_pipeline
    except ImportError:
        from cleaner import aggregate_pipeline

    if not records:
        result = aggregate_pipeline(pd.DataFrame())
        result["summary"]["sourceRecords"] = 0
        return result

    attempts = []

    for record in records:
        test_id = str(record["testId"])
        email = str(record["email"]).strip().lower()
        name = str(record["studentName"]).strip()

        timestamp = _first_valid_timestamp(
            record.get("beltTestUpdatedAt"),
            record.get("calculatedEndTime"),
            record.get("startTime"),
        )

        initial = record["initialBeltLevels"]
        final = record["finalBeltLevels"]

        # Normalize values such as 138, S.138, or Squad 138.
        raw_squad = str(record.get("squadNumber") or "").strip()
        squad_match = __import__("re").search(r"(\d+)", raw_squad)
        batch = f"S.{squad_match.group(1)}" if squad_match else None

        for key, language in LANGUAGES.items():
            attempt = {
                "id": f"{test_id}:{key}",
                "email": email,
                "name": name,
                "workout_slug": language,
                "verified_belt_level": int(initial.get(key, 0)),
                "belt_level": int(final.get(key, 0)),
                "workout_updated_at": timestamp,
            }

            if batch:
                attempt["batch"] = batch

            attempts.append(attempt)

    result = aggregate_pipeline(pd.DataFrame(attempts))
    result["summary"]["sourceRecords"] = len(records)

    return result

