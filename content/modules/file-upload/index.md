---
title: 12 · File Upload Attacks
---

File upload functionality is a frequent source of high-impact bugs. If you can get an executable file onto a web server and reach it via URL, you own that server. This module covers how to defeat each layer defenders stack on top of upload forms — and what to do when the file type is locked down but the format itself is dangerous.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — payloads, commands, and a step-by-step methodology

## Sections

- [[01. Client-Side Validation|Client-Side Validation]] — defeating JavaScript-only filters
- [[02. Blacklist Filter Bypass|Blacklist Filter Bypass]] — fuzzing alternate executable extensions
- [[03. Whitelist Filter Bypass|Whitelist Filter Bypass]] — double extensions and Apache handler confusion
- [[04. Character Injection|Character Injection]] — null bytes and parser tricks
- [[05. MIME and Content-Type Filters|MIME and Content-Type Filters]] — magic bytes and header spoofing
- [[06. Limited Upload Exploitation|Limited Upload Exploitation]] — XSS, XXE, and metadata attacks when RCE is off the table
- [[07. Prevention|Prevention]] — what good defenses look like
