---
title: 09 · Command Injection
---

Command Injection happens when a web application passes user input to a system shell without proper escaping. The simplest high-impact web vulnerability — successful injection gives you arbitrary command execution as whatever user the web server runs as.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — operators, filter bypasses, methodology

## Sections

- [[01. Injection Operators|Injection Operators]] — the characters that chain commands
- [[02. Identifying Filters|Identifying Filters]] — narrowing down what's blocked
- [[03. Space Filter Bypass|Space Filter Bypass]] — tabs, IFS, brace expansion
- [[04. Character Filter Bypass|Character Filter Bypass]] — substring expansion, ASCII shifting
- [[05. Command Obfuscation|Command Obfuscation]] — case manipulation, reversed, base64
- [[06. Evasion Tools|Evasion Tools]] — automating obfuscation
- [[07. Prevention|Prevention]] — what good defenses look like
