---
title: 10 · XSS
---

Cross-Site Scripting (XSS) happens when attacker-controlled JavaScript runs in the victim's browser. The three variants differ in *where* the payload enters the flow — but the end result is always the same: arbitrary JS in a trusted origin, which lets you read cookies, hijack sessions, exfiltrate data, and impersonate users.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — payloads, listener setup, methodology

## Sections

- [[01. XSS Types|XSS Types]] — Stored, Reflected, DOM-based
- [[02. Discovery|Discovery]] — manual testing, automated tools, code review
- [[03. Defacing|Defacing]] — modifying page appearance via DOM
- [[04. Phishing via XSS|Phishing via XSS]] — fake login forms in a trusted origin
- [[05. Session Hijacking|Session Hijacking]] — cookie theft and replay
- [[06. Blind XSS|Blind XSS]] — exploiting endpoints you can't see
- [[07. Prevention|Prevention]] — output encoding, CSP, defensive patterns
