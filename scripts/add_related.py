"""Append an auto-managed '## Related' section to every file in each module,
linking to every sibling file in the same module plus the module index.
Idempotent: the block is wrapped in marker comments and replaced on rerun."""

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content" / "modules"
START = "<!-- auto-related:start -->"
END = "<!-- auto-related:end -->"

TITLE_RE = re.compile(r"^title:\s*(.+?)\s*$", re.MULTILINE)


def read_title(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    m = TITLE_RE.search(text)
    return m.group(1).strip() if m else path.stem


def strip_old_block(text: str) -> str:
    pattern = re.compile(
        rf"\n*{re.escape(START)}.*?{re.escape(END)}\n*", re.DOTALL
    )
    return pattern.sub("\n", text).rstrip() + "\n"


def build_block(module_title: str, module_slug_dir: str, siblings: list[tuple[str, str]]) -> str:
    lines = [START, "", "## Related", "", f"- [[{module_slug_dir}/|{module_title}]] — module index"]
    for basename, title in siblings:
        lines.append(f"- [[{basename}|{title}]]")
    lines.append("")
    lines.append(END)
    return "\n".join(lines)


def process_module(module_dir: Path) -> int:
    files = sorted(p for p in module_dir.glob("*.md") if p.name != "index.md")
    if not files:
        return 0

    index_path = module_dir / "index.md"
    module_title = read_title(index_path) if index_path.exists() else module_dir.name
    module_slug_dir = f"modules/{module_dir.name}"

    # (basename_no_ext, title) for all files in this module
    entries = [(p.stem, read_title(p)) for p in files]

    touched = 0
    for p in files:
        current_stem = p.stem
        siblings = [(stem, title) for (stem, title) in entries if stem != current_stem]
        block = build_block(module_title, module_slug_dir, siblings)

        text = p.read_text(encoding="utf-8")
        cleaned = strip_old_block(text)
        new_text = cleaned.rstrip() + "\n\n" + block + "\n"
        if new_text != text:
            p.write_text(new_text, encoding="utf-8")
            touched += 1
    return touched


def main() -> None:
    total = 0
    for module_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
        n = process_module(module_dir)
        print(f"{module_dir.name}: updated {n} file(s)")
        total += n
    print(f"Total: {total} files updated")


if __name__ == "__main__":
    main()
