---
title: 13 · File Transfer
---

Getting your tools onto the target and getting loot off of it is one of the most practical skills in offensive security. Defenders block the easy paths — outbound HTTP, FTP, SMB — and expect you to give up. This module covers every realistic way to move bytes across a boundary: native OS utilities, scripting languages that happen to be installed, protocols that aren't locked down yet, and techniques for the moments when every one of those fails.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — one-liners for every transfer method and an OPSEC-aware methodology

## Sections

- [[01. Windows File Transfer|Windows File Transfer]] — certutil, bitsadmin, PowerShell cradles, SMB
- [[02. Linux File Transfer|Linux File Transfer]] — curl, wget, scp, nc, /dev/tcp
- [[03. Transferring via Code|Transferring via Code]] — python, php, ruby HTTP servers and upload servers
- [[04. HTTP(S) Upload Methods|HTTP(S) Upload Methods]] — curl -T, PUT, WebDAV, uploadserver
- [[05. Living Off The Land|Living Off The Land]] — LOLBAS and GTFOBins signed-binary abuse
- [[06. Protected Transfer|Protected Transfer]] — openssl, 7z, credentialed SMB
- [[07. Evading Detection|Evading Detection]] — base64 staging, chunking, DNS exfil, slow timing
