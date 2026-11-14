---
title: 03 · Login Brute Forcing
---

Login brute forcing is the brute end of credential attacks — throwing wordlists at authentication endpoints until something sticks. It's noisy, slow, and often rate-limited, but when valid credentials exist in a leak or a weak policy is in place, it's the fastest path from unauthenticated to a shell. This module covers wordlist generation, the two workhorse tools (Hydra and Medusa), and the per-service quirks that trip people up.

Modern targets usually have lockouts, MFA, or CAPTCHA somewhere in the stack. Knowing when to spray vs brute, how to throttle, and which protocols are still soft (SSH keys misconfigured, FTP anonymous-plus-weak, exposed RDP) is what separates a useful attempt from a DoS.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — commands, syntax, and a step-by-step methodology

## Sections

- [[01. Fundamentals|Fundamentals]] — brute vs dictionary vs hybrid, target selection, lockouts
- [[02. Custom Wordlists|Custom Wordlists]] — cewl, crunch, hashcat rules, username enumeration
- [[03. Hydra|Hydra]] — syntax, HTTP forms, SSH, FTP, parallelism, resuming
- [[04. Medusa|Medusa]] — syntax, modules, and when to pick it over Hydra
- [[05. Service-Specific Tips|Service-Specific Tips]] — SSH, FTP, RDP, SMB, HTTP-basic, HTTP-form gotchas
