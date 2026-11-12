---
title: File Inclusion
---

File Inclusion vulnerabilities happen when a web app builds a file path from unsanitized user input and passes it to an inclusion function. **Local File Inclusion (LFI)** reads (or executes) files on the server; **Remote File Inclusion (RFI)** includes files from an attacker-controlled URL. The two can combine into full RCE.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — payloads, filters, and methodology

## Sections

- [[01. LFI Fundamentals|LFI Fundamentals]] — vulnerable functions and capability matrix
- [[02. Path Traversal|Path Traversal]] — core LFI payloads and variants
- [[03. Filter Bypass|Filter Bypass]] — defeating sanitization
- [[04. PHP Wrappers|PHP Wrappers]] — source disclosure and RCE via php://
- [[05. LFI to RCE|LFI to RCE]] — log poisoning, session files, environ
- [[06. Remote File Inclusion|Remote File Inclusion]] — including attacker-hosted files
- [[07. Prevention|Prevention]] — what good defenses look like
