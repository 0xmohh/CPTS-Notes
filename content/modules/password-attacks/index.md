---
title: 16 · Password Attacks
---

Passwords are still the weakest link in most environments — and the techniques to extract, crack, or reuse them span every OS and protocol. This module covers the full credential attack chain: hunting cleartext creds on hosts and the wire, dumping hashes out of Windows and Linux, cracking them offline, brute-forcing services remotely, and reusing stolen material (hashes, tickets, certificates) for lateral movement.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — the full command reference across every section

## Sections

- [[01. Fundamentals|Fundamentals]] — hash types, methodology, where creds live
- [[02. Credentials in the Network|Credentials in the Network]] — share hunting (Snaffler, MANSPIDER) and traffic sniffing (Pcredz, Responder)
- [[03. Credentials from Linux|Credentials from Linux]] — `/etc/shadow`, SSH keys, config files, LaZagne, Mimipenguin
- [[04. Credentials from Windows|Credentials from Windows]] — Credential Manager, DPAPI, browsers, RDP saved creds
- [[05. LSASS Dumping|LSASS Dumping]] — pypykatz, Mimikatz, comsvcs.dll, Task Manager
- [[06. SAM, SYSTEM & SECURITY|SAM, SYSTEM & SECURITY]] — local hashes + DCC2 cached domain creds
- [[07. NTDS.dit & Domain Credentials|NTDS.dit & Domain Credentials]] — VSS, secretsdump, DCSync
- [[08. Cracking Hashes|Cracking Hashes]] — hashcat, john, custom wordlists, archive cracking
- [[09. Remote Password Attacks|Remote Password Attacks]] — NetExec, Hydra, Medusa against SMB/WinRM/RDP/SSH/MSSQL
- [[10. Pass-the-Hash, Ticket, Certificate|Pass-the-Hash, Ticket, Certificate]] — reuse stolen material for lateral movement
