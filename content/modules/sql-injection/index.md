---
title: SQL Injection
---

SQL Injection happens when user input ends up inside a SQL query without proper sanitization. It's one of the oldest and most dangerous web vulnerabilities — a successful SQLi can extract entire databases, bypass authentication, read files on the server, and sometimes achieve RCE.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — payloads, commands, and a step-by-step methodology

## Sections

- [[01. MySQL Fundamentals|MySQL Fundamentals]] — the SQL you need to know to exploit SQLi
- [[02. Detection|Detection]] — spotting SQLi in the wild
- [[03. Authentication Bypass|Authentication Bypass]] — login screens as free wins
- [[04. UNION-Based Injection|UNION-Based Injection]] — the heavyweight extraction technique
- [[05. Database Enumeration|Database Enumeration]] — schemas, tables, columns, data
- [[06. Reading and Writing Files|Reading and Writing Files]] — LOAD_FILE and INTO OUTFILE for RCE
- [[07. Blind SQL Injection|Blind SQL Injection]] — boolean and time-based extraction
- [[08. WAF and Filter Bypass|WAF and Filter Bypass]] — when payloads get blocked
