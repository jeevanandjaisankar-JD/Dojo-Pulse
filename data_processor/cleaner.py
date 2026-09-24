import datetime
import re
from pathlib import Path
import pandas as pd

COLUMN_ALIASES = {
    "email": ["email", "student_email", "mail", "user_email", "studentemail"],
    "id": ["id", "slot_id", "slotid", "submission_id", "attempt_id", "test_id"],
    "workout_slug": ["workout_slug", "workout", "slug", "language", "lang", "track"],
    "belt_level": ["belt_level", "beltlevel", "belt", "current_belt", "current_belt_level", "post_belt"],
    "verified_belt_level": [
        "verified_belt_level",
        "verifiedbeltlevel",
        "verified_belt",
        "verified_belts",
        "pre_belt",
        "base_belt",
    ],
    "workout_updated_at": [
        "workout_updated_at",
        "updated_at",
        "date",
        "timestamp",
        "time",
        "created_at",
        "datetime",
    ],
    "name": ["name", "student_name", "studentname", "full_name"],
    "batch": ["batch", "cohort", "class"],
    "student_id": ["student_id", "studentid", "student", "roll_number", "roll_no", "reg_no"],
}

BASE_LANGUAGES = ["Python", "Node.js", "Java", "C++"]


def read_uploaded_file(file_path):
    """Read uploaded CSV, XLS or XLSX file."""
    file_path = Path(file_path)
    extension = file_path.suffix.lower()

    if extension == ".csv":
        df = pd.read_csv(file_path)
    elif extension in [".xls", ".xlsx"]:
        df = pd.read_excel(file_path)
    else:
        raise ValueError(
            f"Unsupported file format: {extension}. Use CSV, XLS or XLSX."
        )

    return df


def derive_name_from_email(email: str) -> str:
    """Extract a clean, title-cased name from an email address."""
    if not email or "@" not in email:
        return "Student"
    username = email.split("@")[0]
    # Remove Kalvium batch patterns like .s.138, .s138, _s_139, -s-139, or trailing digits
    cleaned = re.sub(r"[\._-]s[\._-]?\d+$", "", username, flags=re.IGNORECASE)
    cleaned = re.sub(r"\d+$", "", cleaned)
    parts = re.split(r"[\._-]+", cleaned)
    valid_parts = [p.capitalize() for p in parts if p.strip()]
    if valid_parts:
        return " ".join(valid_parts)
    return username.capitalize() or "Student"


def derive_batch_from_email(email: str, default_batch: str = "S.138") -> str:
    """Extract batch designation (e.g. S.138, S.139) from email or return default."""
    if not email:
        return default_batch
    match = re.search(r"[\._-]s[\._-]?(\d+)", email, re.IGNORECASE)
    if match:
        return f"S.{match.group(1)}"
    return default_batch


def normalize_language(slug: str) -> str:
    """Map workout slug to canonical languages matching Student model enum."""
    s = str(slug).strip().lower()
    if any(k in s for k in ["python", "py"]):
        return "Python"
    if any(k in s for k in ["node", "js", "javascript"]):
        return "Node.js"
    if "java" in s and "script" not in s:
        return "Java"
    if any(k in s for k in ["cpp", "c++", "c_plus_plus", "clang"]):
        return "C++"
    if s in ["other", "none", "nan", ""]:
        return "Python"
    return "Other"


def format_datetime_info(val):
    """Parse timestamp into UTC datetime and standard string formats."""
    if pd.isna(val) or val is None:
        dt = datetime.datetime.now(datetime.timezone.utc)
    else:
        try:
            dt = pd.to_datetime(val, utc=True)
            if pd.isna(dt):
                dt = datetime.datetime.now(datetime.timezone.utc)
            else:
                dt = dt.to_pydatetime()
        except Exception:
            dt = datetime.datetime.now(datetime.timezone.utc)

    timestamp = dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    date_str = dt.strftime("%Y-%m-%d")
    time_str = dt.strftime("%I:%M %p")
    return dt, timestamp, date_str, time_str


def clean_data(df):
    """Standardize column headers, clean types, and remove duplicate evaluations."""
    if df is None or df.empty:
        return pd.DataFrame()

    # Standardize column headers to canonical names
    cleaned_cols = {}
    normalized_names = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    for orig, norm in zip(df.columns, normalized_names):
        mapped = None
        for canonical, aliases in COLUMN_ALIASES.items():
            if norm == canonical or norm in aliases:
                mapped = canonical
                break
        cleaned_cols[orig] = mapped if mapped else norm

    df = df.rename(columns=cleaned_cols).copy()

    # Ensure email or identifier column exists
    if "email" not in df.columns:
        if "student_id" in df.columns:
            df["email"] = df["student_id"]
        else:
            raise ValueError("Evaluations file must contain an 'email' column.")

    # Email normalization
    df["email"] = df["email"].astype(str).str.strip().str.lower()
    df = df[df["email"].str.len() > 0]
    df = df[~df["email"].isin(["nan", "none", "null"])]

    if df.empty:
        return df

    # Language formatting
    if "workout_slug" not in df.columns:
        df["workout_slug"] = "python"
    else:
        df["workout_slug"] = df["workout_slug"].astype(str).str.strip().str.lower()

    # Belt levels numeric coercion
    if "belt_level" not in df.columns:
        df["belt_level"] = 0
    df["belt_level"] = pd.to_numeric(df["belt_level"], errors="coerce").fillna(0).astype(int)

    if "verified_belt_level" not in df.columns:
        df["verified_belt_level"] = 0
    df["verified_belt_level"] = (
        pd.to_numeric(df["verified_belt_level"], errors="coerce").fillna(0).astype(int)
    )

    # Convert slot closing time into datetime
    if "workout_updated_at" not in df.columns:
        df["workout_updated_at"] = pd.Timestamp.now(tz="UTC")
    else:
        df["workout_updated_at"] = pd.to_datetime(
            df["workout_updated_at"], errors="coerce", utc=True
        )

    # Remove duplicate slot IDs if present
    if "id" in df.columns:
        valid_id_mask = df["id"].notna() & (df["id"].astype(str).str.strip() != "")
        valid_ids = df[valid_id_mask].drop_duplicates(subset=["id"])
        invalid_ids = df[~valid_id_mask]
        df = pd.concat([valid_ids, invalid_ids], ignore_index=True)
    else:
        df["id"] = None

    return df


def aggregate_pipeline(df, slot_number=1):
    """
    Transforms cleaned DataFrame into the JSON payload expected by the Node.js backend.
    Returns { summary: {...}, cleanedStudents: [...] }.
    """
    if df is None or df.empty:
        return {
            "summary": {
                "totalStudents": 0,
                "totalSlotsEvaluated": 0,
                "improved": 0,
                "notImproved": 0,
                "totalBeltsEarned": 0,
                "improvementRate": 0.0,
                "languages": {
                    lang: {"slots": 0, "beltsEarned": 0, "improvedStudents": 0}
                    for lang in BASE_LANGUAGES
                },
            },
            "cleanedStudents": [],
        }

    language_stats = {
        lang: {"slots": 0, "beltsEarned": 0, "improvedStudents": 0}
        for lang in BASE_LANGUAGES
    }
    improved_students_by_lang = {lang: set() for lang in BASE_LANGUAGES}

    processed_attempts = []
    for idx, (_, row) in enumerate(df.iterrows()):
        email = str(row["email"]).strip().lower()
        if not email or email in ["nan", "none"]:
            continue

        student_id = (
            str(row["student_id"]).strip()
            if "student_id" in row and pd.notna(row["student_id"]) and str(row["student_id"]).strip() not in ["", "nan"]
            else email
        )
        name = (
            str(row["name"]).strip()
            if "name" in row and pd.notna(row["name"]) and str(row["name"]).strip() not in ["", "nan"]
            else derive_name_from_email(email)
        )
        batch = (
            str(row["batch"]).strip()
            if "batch" in row and pd.notna(row["batch"]) and str(row["batch"]).strip() not in ["", "nan"]
            else derive_batch_from_email(email)
        )

        raw_id = row.get("id")
        slot_id = (
            str(raw_id).strip()
            if pd.notna(raw_id) and str(raw_id).strip() not in ["", "nan", "None"]
            else f"slot-{slot_number}-{idx + 1}"
        )
        language = normalize_language(row.get("workout_slug", "python"))

        verified_belts = max(0, int(row.get("verified_belt_level", 0)))
        belt_level = max(0, int(row.get("belt_level", 0)))
        belts_earned = max(0, belt_level - verified_belts)
        is_improved = belts_earned > 0
        status = "IMPROVED" if is_improved else "NO_IMPROVEMENT"

        dt, timestamp, date_str, time_str = format_datetime_info(row.get("workout_updated_at"))

        if language not in language_stats:
            language_stats[language] = {"slots": 0, "beltsEarned": 0, "improvedStudents": 0}
            improved_students_by_lang[language] = set()

        language_stats[language]["slots"] += 1
        language_stats[language]["beltsEarned"] += belts_earned
        if is_improved:
            improved_students_by_lang[language].add(student_id)

        processed_attempts.append({
            "studentId": student_id,
            "email": email,
            "name": name,
            "batch": batch,
            "slotId": slot_id,
            "language": language,
            "verifiedBelts": verified_belts,
            "beltLevel": belt_level,
            "beltsEarned": belts_earned,
            "isImproved": is_improved,
            "status": status,
            "dt": dt,
            "timestamp": timestamp,
            "date": date_str,
            "time": time_str,
        })

    # Group attempts by student
    students_map = {}
    for att in processed_attempts:
        sid = att["studentId"]
        if sid not in students_map:
            students_map[sid] = {
                "studentId": sid,
                "email": att["email"],
                "name": att["name"],
                "batch": att["batch"],
                "attempts": [],
            }
        students_map[sid]["attempts"].append(att)

    cleaned_students = []
    total_belts_overall = 0
    improved_students_count = 0

    for sid, sdata in students_map.items():
        attempts = sdata["attempts"]
        attempts.sort(key=lambda a: a["dt"])

        total_slots_attempted = len(attempts)
        languages_attempted = list(dict.fromkeys(a["language"] for a in attempts))
        total_belts_earned = sum(a["beltsEarned"] for a in attempts)
        total_belts_overall += total_belts_earned

        is_student_improved = total_belts_earned > 0
        if is_student_improved:
            improved_students_count += 1
            improvement_status = "IMPROVED"
        else:
            improvement_status = "NO_IMPROVEMENT"

        highest_achieved = max(a["beltLevel"] for a in attempts)
        max_verified = max(a["verifiedBelts"] for a in attempts)
        if total_belts_earned > 0:
            verified_belts = max(0, highest_achieved - total_belts_earned)
            current_belt_level = highest_achieved
        else:
            verified_belts = max_verified
            current_belt_level = max(highest_achieved, max_verified)

        # Group attempts by date for sameDayProgress
        date_groups = {}
        for a in attempts:
            d = a["date"]
            if d not in date_groups:
                date_groups[d] = []
            date_groups[d].append(a)

        same_day_progress = []
        for date_str in sorted(date_groups.keys()):
            day_attempts = date_groups[date_str]
            day_languages = list(dict.fromkeys(a["language"] for a in day_attempts))
            day_net_belts = sum(a["beltsEarned"] for a in day_attempts)
            day_is_improved = day_net_belts > 0

            formatted_attempts = [
                {
                    "slotId": a["slotId"],
                    "language": a["language"],
                    "verifiedBelts": int(a["verifiedBelts"]),
                    "beltLevel": int(a["beltLevel"]),
                    "beltsEarned": int(a["beltsEarned"]),
                    "isImproved": bool(a["isImproved"]),
                    "status": a["status"],
                    "timestamp": a["timestamp"],
                    "time": a["time"],
                }
                for a in day_attempts
            ]

            same_day_progress.append({
                "date": date_str,
                "totalSlotsAttempted": int(len(day_attempts)),
                "languages": day_languages,
                "netBeltsEarned": int(day_net_belts),
                "isImproved": bool(day_is_improved),
                "attempts": formatted_attempts,
            })

        cleaned_students.append({
            "studentId": sid,
            "email": sdata["email"],
            "name": sdata["name"],
            "batch": sdata["batch"],
            "verifiedBelts": int(verified_belts),
            "currentBeltLevel": int(current_belt_level),
            "totalBeltsEarned": int(total_belts_earned),
            "totalSlotsAttempted": int(total_slots_attempted),
            "improvementStatus": improvement_status,
            "languagesAttempted": languages_attempted,
            "sameDayProgress": same_day_progress,
        })

    for lang, students_set in improved_students_by_lang.items():
        language_stats[lang]["improvedStudents"] = len(students_set)

    total_students = len(cleaned_students)
    total_slots_evaluated = len(processed_attempts)
    not_improved_count = total_students - improved_students_count
    improvement_rate = (
        round((improved_students_count / max(total_students, 1)) * 100, 1)
        if total_students > 0
        else 0.0
    )

    summary = {
        "totalStudents": int(total_students),
        "totalSlotsEvaluated": int(total_slots_evaluated),
        "improved": int(improved_students_count),
        "notImproved": int(not_improved_count),
        "totalBeltsEarned": int(total_belts_overall),
        "improvementRate": float(improvement_rate),
        "languages": language_stats,
    }

    return {
        "summary": summary,
        "cleanedStudents": cleaned_students,
    }


def process_pipeline(file_path, slot_number=1):
    """End-to-end pipeline: load file, clean columns, and aggregate for backend."""
    df = read_uploaded_file(file_path)
    cleaned_df = clean_data(df)
    return aggregate_pipeline(cleaned_df, slot_number=slot_number)