---
title: 14 · Shells & Payloads
---

Getting code execution is only half the job — you still need a shell that survives, lets you type, and doesn't get killed by Defender in the first five seconds. This module covers the payload matrix: what shell to drop on what platform, how to catch it, how to upgrade it into something usable, and what defenders see when you do.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — one-liners, msfvenom recipes, and a step-by-step methodology

## Sections

- [[01. Shell Types|Shell Types]] — bind vs reverse, TCP vs UDP, staged vs stageless
- [[02. Reverse Shells (Linux)|Reverse Shells (Linux)]] — bash, python, perl, php, nc, socat one-liners
- [[03. Reverse Shells (Windows)|Reverse Shells (Windows)]] — PowerShell, nc.exe, cmd payloads
- [[04. Webshells|Webshells]] — PHP, ASPX, JSP shells and interactive webshell frameworks
- [[05. msfvenom|msfvenom]] — payload generation across every format that matters
- [[06. Spawning Interactive Shells|Spawning Interactive Shells]] — TTY upgrades so you can actually work
- [[07. Detection & Prevention|Detection & Prevention]] — what blue team sees and how to stay quieter
