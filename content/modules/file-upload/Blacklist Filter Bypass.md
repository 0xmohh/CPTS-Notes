---
title: Blacklist Filter Bypass
---

Blacklists are the weakest form of extension validation. PHP alone has close to a dozen valid extensions — blocking all of them is a losing game. If the server is relying on a deny-list, you can almost always find an extension that slips through.

## Why Blacklists Fail

Every language has multiple file extensions the server will execute:

- **PHP:** `.php`, `.phtml`, `.phar`, `.php3`, `.php4`, `.php5`, `.php7`, `.pht`, `.phps`
- **ASP:** `.asp`, `.aspx`, `.ashx`, `.asmx`, `.cer`, `.asa`
- **JSP:** `.jsp`, `.jspx`, `.jsw`, `.jsv`, `.jspf`

Even if the blacklist is thorough, bad practices like **case-sensitive matching** let you bypass with a one-letter change (`.pHp`, `.Php`).

## Methodology

1. **Confirm the blacklist exists.** Upload `shell.php` and note the exact error message (e.g. "Extension not allowed").
2. **Fuzz alternate extensions.** Send the request to Burp Intruder, mark the extension as a payload position, and load a wordlist of PHP-equivalent extensions.
3. **Uncheck URL-encoding** in Intruder's payload settings — otherwise `.` gets encoded and your payloads don't match real filenames.
4. **Start the attack and look for anomalies.** Responses with different sizes or status codes indicate allowed extensions.
5. **Verify execution.** Upload a trivial test file (`<?php echo "pwned"; ?>`) with each allowed extension. The ones that print "pwned" when visited are the ones that actually execute — allowed-to-upload doesn't guarantee allowed-to-execute.

A common finding: `.phar` passes most blacklists and gets executed as PHP under default Apache configurations.

> [!warning] Upload ≠ execution
> Not every allowed extension will run as PHP on every server. Fuzz, upload a "hello world" test file in each, and confirm which one executes before writing your real shell.

## Case Toggling

If the filter matches case-sensitively:

```
shell.pHp
shell.Php
shell.PHP
shell.pHaR
```

On Linux filesystems file extensions are case-insensitive from the web server's perspective, so `.pHp` still gets executed as PHP — but the string `.pHp` doesn't match a blacklist entry of `.php`.
