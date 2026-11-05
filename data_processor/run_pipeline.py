
import argparse
import json
import sys
from pathlib import Path

from belt_test_processor import (
    REQUIRED_COLUMNS,
    process_belt_test_file,
    aggregate_records,
)
from cleaner import process_pipeline



def run_pipeline(file_path, slot_number=1):
    """Process a new uploaded file."""
    file_path = Path(file_path)

    # Only the new belt-test format is detected in CSV files.
    if file_path.suffix.lower() == ".csv":
        import pandas as pd

        columns = {
            str(column).strip().lower()
            for column in pd.read_csv(file_path, nrows=0).columns
        }

        if REQUIRED_COLUMNS.issubset(columns):
            return process_belt_test_file(file_path)

    # Preserve existing CSV and Excel processing.
    return process_pipeline(file_path, slot_number=slot_number)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Dojo-Pulse Data Processing Pipeline"
    )

    parser.add_argument("--file", "-f", type=str)
    parser.add_argument("--records-file", type=str)
    parser.add_argument("--slot", "-s", type=int, default=1)

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    try:
        if args.records_file:
            records_path = Path(args.records_file)

            if not records_path.exists():
                raise FileNotFoundError(
                    f"Records JSON file not found: {records_path}"
                )

            with records_path.open("r", encoding="utf-8") as file:
                records = json.load(file)

            if not isinstance(records, list):
                raise ValueError("Records JSON must contain a list.")

            result = aggregate_records(records)

        elif args.file:
            file_path = Path(args.file)

            if not file_path.exists():
                raise FileNotFoundError(
                    f"Uploaded file not found: {file_path}"
                )

            result = run_pipeline(file_path, slot_number=args.slot)

        else:
            raise ValueError(
                "Provide either --file or --records-file."
            )

        print(json.dumps(result))

    except Exception as error:
        sys.stderr.write(f"Pipeline processing failed: {error}\n")
        sys.exit(1)
