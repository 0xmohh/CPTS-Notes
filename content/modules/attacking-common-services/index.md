---
title: 17 · Attacking Common Services
---

Before web apps and AD-specific attacks, there's a layer of services that live on nearly every network — FTP, SMB, SQL, RDP, DNS, mail. Each one has a decades-long history of misconfiguration, weak defaults, and auth it was never designed to protect. This module is the per-service operator reference: how to enumerate it, how to abuse it, and what to do once you're in.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — the per-service command dump

## Sections

- [[01. Fundamentals|Fundamentals]] — service enumeration order, nmap NSE, banner grabbing
- [[02. FTP|FTP]] — anonymous login, cleartext sniffing, `SITE EXEC`, bounce
- [[03. SMB|SMB]] — null sessions, share enumeration, RCE via PsExec/WMI, SMB signing
- [[04. SQL Databases|SQL Databases]] — MSSQL `xp_cmdshell`, MySQL `INTO OUTFILE`, linked servers
- [[05. RDP|RDP]] — brute force, hijacking, BlueKeep, session reuse
- [[06. DNS|DNS]] — zone transfer, subdomain brute, dynamic update abuse
- [[07. Email (SMTP, IMAP, POP3)|Email (SMTP, IMAP, POP3)]] — user enumeration, open relay, auth brute force
