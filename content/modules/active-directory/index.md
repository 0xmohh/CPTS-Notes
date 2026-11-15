---
title: 19 · Active Directory Enumeration & Attacks
---

Active Directory is the most common identity backbone in enterprise environments — and the richest attack surface. Any domain user can enumerate most objects by design, which means the gap between "foothold" and "Domain Admin" is usually paved with misconfigurations, weak service-account passwords, and legacy protocols defenders forgot about. This module is the operator's reference: commands, payloads, and short explanations of when each attack applies.

The flow is roughly: external recon → unauth enum → poisoning / password spray → credentialed enum → Kerberoasting / ACL abuse → lateral movement → DCSync → cross-forest. Section pages explain the "how/why"; the checklist is the exam-day crib sheet.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — every command, every stage, in order

## Sections

- [[01. AD Fundamentals|AD Fundamentals]] — forests, domains, trusts, FSMO, GPOs, SIDs, groups
- [[02. Core Protocols|Core Protocols]] — Kerberos, LDAP, DNS, MSRPC, SMB/NTLM
- [[03. External Recon & Initial Enumeration|External Recon & Initial Enumeration]] — OSINT and unauth internal enum
- [[04. LLMNR & NBT-NS Poisoning|LLMNR & NBT-NS Poisoning]] — Responder, Inveigh, mitm6, relay
- [[05. Password Policy & User Lists|Password Policy & User Lists]] — build the spray list without lockouts
- [[06. Password Spraying|Password Spraying]] — kerbrute, netexec, DomainPasswordSpray
- [[07. Credentialed Enumeration (Linux)|Credentialed Enumeration (Linux)]] — netexec, bloodhound-python, ldapsearch
- [[08. Credentialed Enumeration (Windows)|Credentialed Enumeration (Windows)]] — PowerView, SharpHound, snaffler
- [[09. Kerberoasting & AS-REP Roasting|Kerberoasting & AS-REP Roasting]] — SPN tickets and pre-auth-disabled accounts
- [[10. ACL Abuse|ACL Abuse]] — GenericAll, WriteDACL, DCSync, shadow credentials
- [[11. Lateral Movement & Attacks|Lateral Movement & Attacks]] — PtH, PtT, Golden/Silver tickets, double-hop
- [[12. Trust Abuse|Trust Abuse]] — child→parent ExtraSids, cross-forest Kerberoast
- [[13. Hardening & Detection|Hardening & Detection]] — what good defenses look like
