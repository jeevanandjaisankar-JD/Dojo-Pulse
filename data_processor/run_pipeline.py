import argparse
import json
import sys
from pathlib import Path
from cleaner import process_pipeline, read_uploaded_file, clean_data, aggregate_pipeline


def run_pipeline(file_path, slot_number=1):
    """Run the complete cleaning and aggregation pipeline."""
    return process_pipeline(file_path, slot_number=slot_number)


def parse_args():
    parser = argparse.ArgumentParser(description="Dojo-Pulse Data Cleaner Pipeline")
    parser.add_argument("--file", "-f", type=str, help="Path to uploaded CSV/Excel file")
    parser.add_argument(
        "--slot",
        "-s",
        type=int,
        default=1,
        help="Evaluation slot / test round number (default: 1)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    target_file = None
    if args.file:
        raw_path = Path(args.file)
        if raw_path.exists():
            target_file = raw_path
        else:
            # Check relative to backend/uploads or project root
            candidates = [
                Path.cwd() / args.file,
                Path(__file__).resolve().parent.parent / "backend" / args.file,
                Path(__file__).resolve().parent.parent / args.file,
            ]
            for cand in candidates:
                if cand.exists():
                    target_file = cand
                    break
            if not target_file:
                target_file = raw_path

    if not target_file:
        # Fallback for manual testing: check backend/uploads for latest spreadsheet
        upload_folder = Path(__file__).resolve().parent.parent / "backend" / "uploads"
        if upload_folder.exists():
            data_files = [
                f
                for f in upload_folder.glob("*")
                if f.suffix.lower() in [".csv", ".xls", ".xlsx"]
            ]
            if data_files:
                data_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
                target_file = data_files[0]

    if not target_file or not target_file.exists():
        sys.stderr.write("No uploaded evaluations file found or specified via --file\n")
        sys.exit(1)

    try:
        result = run_pipeline(target_file, slot_number=args.slot)
        # CRITICAL: stdout must ONLY contain valid JSON for Node.js JSON.parse()
        print(json.dumps(result))
    except Exception as err:
        sys.stderr.write(f"Pipeline processing failed: {err}\n")
        sys.exit(1)