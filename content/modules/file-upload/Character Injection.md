---
title: Character Injection
---

Some older or misconfigured servers can be confused by non-printable or special characters placed around the extension. These bypasses rely on inconsistencies between the application's filter and the underlying OS or language's filename parsing.

> [!note] Mileage varies
> Character injection depends on specific server, language, and OS versions. It fails often on modern stacks — but when you've exhausted other bypasses, it's cheap to try.

## Characters Worth Trying

| Character | Use Case |
|---|---|
| `%00` | Null byte — PHP 5.x and earlier terminate the filename here |
| `%20` | Space — can confuse some parsers |
| `%0a` | Newline (LF) — splits the filename in some logs/configs |
| `%0d0a` | CRLF — similar to above |
| `/` | Path separator — may let the file jump directories |
| `.\` | Windows path quirk |
| `.` | Trailing dot — Windows strips it, Linux keeps it |
| `…` | Horizontal ellipsis — a Unicode trick for Windows |
| `:` | Alternate data stream on Windows — `shell.aspx:.png` can execute as `.aspx` |

## Generating a Wordlist

Rather than testing one-by-one, generate every permutation and fuzz with Intruder:

```bash
for char in '%20' '%0a' '%00' '%0d0a' '/' '.\\' '.' '…' ':'; do
    for ext in '.php' '.phps' '.phar'; do
        echo "shell$char$ext.jpg"  >> wordlist.txt
        echo "shell$ext$char.jpg"  >> wordlist.txt
        echo "shell.jpg$char$ext"  >> wordlist.txt
        echo "shell.jpg$ext$char"  >> wordlist.txt
    done
done
```

Load the wordlist into Burp Intruder, uncheck URL-encoding (the encodings are already in the payload), and start the attack. Look for anomalous responses the same way you did for extension fuzzing.

## Why It Works (When It Does)

Each character exploits a different layer of parsing:

- **Null byte (`%00`)** — in older PHP, the string is C-style and terminates at `\0`. The filter sees `shell.php%00.jpg` and allows it (ends in `.jpg`); the filesystem sees `shell.php` and stores it as PHP.
- **Windows ADS (`:`)** — NTFS alternate data streams. `shell.aspx:.png` creates a stream named `.png` inside a file named `shell.aspx`. The web server then serves `shell.aspx`.
- **Trailing dot / space** — some filters normalize these away (making the filter see `.jpg`), while the filesystem stores them (making the file `.php`).
