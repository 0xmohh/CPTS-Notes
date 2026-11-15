---
title: 09 · Using SQLMap
---

SQLMap is the detection-and-exploitation workhorse for SQL injection. Point it at a parameter, let it fingerprint, then ride its boundary/payload engine from a single quote all the way to an OS shell. This module covers how to feed it real-world requests, tune its noise, beat WAFs with tamper scripts, and escalate a confirmed SQLi into a file read, file write, or `--os-shell`.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — one-liners, flags, tampers, and a full methodology

## Sections

- [[01. Overview & Setup|Overview & Setup]] — install, supported DBMSes, injection techniques (BEUSTQ)
- [[02. Building Attacks|Building Attacks]] — `-u`, `-r`, `--data`, `--cookie`, `--headers`, injection marks
- [[03. Handling Errors|Handling Errors]] — `--parse-errors`, `-v 6`, `-t`, routing through Burp
- [[04. Attack Tuning|Attack Tuning]] — `--level`, `--risk`, `--technique`, `--threads`, `--dbms`
- [[05. Database Enumeration|Database Enumeration]] — `--dbs`, `--tables`, `--columns`, `--dump`, `--schema`, `--search`
- [[06. Bypassing Protections|Bypassing Protections]] — tamper scripts, `--random-agent`, `--proxy`, `--tor`, CSRF tokens
- [[07. OS Exploitation|OS Exploitation]] — `--os-shell`, `--os-cmd`, `--os-pwn`, `--file-read`, `--file-write`
