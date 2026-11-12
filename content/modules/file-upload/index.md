---
title: File Upload Attacks
---

File upload functionality is a frequent source of high-impact bugs. If you can get an executable file onto a web server and reach it via URL, you own that server. This module covers how to defeat each layer defenders stack on top of upload forms — and what to do when the file type is locked down but the format itself is dangerous.

## Sections

- [[Client-Side Validation|Client-Side Validation]] — defeating JavaScript-only filters
- [[Blacklist Filter Bypass|Blacklist Filter Bypass]] — fuzzing alternate executable extensions
- [[Whitelist Filter Bypass|Whitelist Filter Bypass]] — double extensions and Apache handler confusion
- [[Character Injection|Character Injection]] — null bytes and parser tricks
- [[MIME and Content-Type Filters|MIME and Content-Type Filters]] — magic bytes and header spoofing
- [[Limited Upload Exploitation|Limited Upload Exploitation]] — XSS, XXE, and metadata attacks when RCE is off the table
- [[Prevention|Prevention]] — what good defenses look like

## Quick Reference

- [[cheatsheet-checklist|📋 Cheatsheet & Checklist]] — payloads, commands, and a step-by-step methodology
