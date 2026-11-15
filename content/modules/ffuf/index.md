---
title: 06 · Attacking Web Applications with Ffuf
---

Ffuf is the web fuzzer you reach for when you need to brute-force anything that varies in a request — paths, extensions, parameter names, parameter values, subdomains, virtual hosts, headers. Point it at a URL, drop the `FUZZ` keyword where you want iteration to happen, feed it a wordlist, and read the output. This module covers how to drive ffuf effectively against real targets: picking the right wordlists, filtering out noise, chaining recursion, and layering fuzz positions to find hidden attack surface.

Speed is the easy part. The hard part is reading the response: knowing which status codes to keep, which sizes to filter, and when a "200 OK" is actually a 404 in disguise. That's where this module focuses.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — commands by scenario, flags, and a methodology checklist

## Sections

- [[01. Basic Fuzzing|Basic Fuzzing]] — syntax, the FUZZ keyword, filters, and matchers
- [[02. Directory & File Discovery|Directory & File Discovery]] — wordlists, extension fuzzing, recursion
- [[03. Subdomain & VHost Enumeration|Subdomain & VHost Enumeration]] — DNS vs Host header fuzzing
- [[04. Parameter Fuzzing|Parameter Fuzzing]] — finding hidden GET/POST parameters and brute-forcing values
- [[05. Advanced Techniques|Advanced Techniques]] — multiple FUZZ keywords, auth, config files, rate control
