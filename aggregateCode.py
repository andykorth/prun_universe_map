# save as export_code.py at the project root
from __future__ import annotations

import os
from pathlib import Path
import argparse

# Which file types to include (text-based code files only)
ALLOWED_EXTS = {
    ".js", ".jsx", ".mjs", ".cjs",
    ".ts", ".tsx",
    ".css", ".scss", ".sass",
    ".html",
    ".md"
}

# Folders to skip completely
EXCLUDED_DIRS = {
    "node_modules", ".git", ".vscode", ".idea",
    "dist", "build", "out", "coverage",
    ".next", ".turbo", ".cache", ".vercel",
    ".parcel-cache", ".pnpm", ".yarn"
}

HEADER_TEMPLATE = "\n\n--- FILE: {rel} ---\n\n"


def should_skip_dir(dirname: str) -> bool:
    return dirname in EXCLUDED_DIRS


def is_relevant_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTS


def export_project_code(root: Path, out_file: Path) -> None:
    root = root.resolve()
    with out_file.open("w", encoding="utf-8") as out:
        for dirpath, dirnames, filenames in os.walk(root):
            # Prune directories in-place so os.walk doesn't descend into them
            dirnames[:] = [d for d in dirnames if not should_skip_dir(d)]

            for name in sorted(filenames):
                if not is_relevant_file(name):
                    continue

                file_path = Path(dirpath) / name
                try:
                    content = file_path.read_text(encoding="utf-8", errors="replace")
                except Exception as e:
                    # Skip unreadable files but note them
                    out.write(f"\n\n--- FILE: {file_path.relative_to(root).as_posix()} (SKIPPED: {e}) ---\n\n")
                    continue

                rel = file_path.relative_to(root).as_posix()
                out.write(HEADER_TEMPLATE.format(rel=rel))
                out.write(content)


def main():
    parser = argparse.ArgumentParser(description="Export relevant project code into a single text file.")
    parser.add_argument("--root", default=".", help="Project root (default: current directory)")
    parser.add_argument("--out", default="project_code_export.txt", help="Output text file")
    args = parser.parse_args()

    root = Path(args.root)
    out_file = Path(args.out)

    if not root.exists():
        raise SystemExit(f"Root path not found: {root}")

    export_project_code(root, out_file)
    print(f"Code export completed: {out_file.resolve()}")


if __name__ == "__main__":
    main()
