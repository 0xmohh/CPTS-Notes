---
title: 18 · Pivoting, Tunneling & Port Forwarding
---

Every network is a series of boundaries — DMZs, flat segments, firewalled subnets, air-gapped admin VLANs. Once you own a host, pivoting is how you reach everything behind it. This module covers the full toolbox: SSH tunnels, SOCKS proxies, meterpreter routing, HTTP/DNS/ICMP covert channels, and the Windows-side tooling for environments where Linux-native tools don't run.

## Quick Reference

- [[00. Cheatsheet & Checklist|📋 Cheatsheet & Checklist]] — every tool, every mode, one command each

## Sections

- [[01. Fundamentals|Fundamentals]] — forward vs reverse, local vs remote vs dynamic, SOCKS mechanics
- [[02. SSH Tunneling|SSH Tunneling]] — `-L`, `-R`, `-D` flags and when each applies
- [[03. Meterpreter & Metasploit Routing|Meterpreter & Metasploit Routing]] — autoroute, portfwd, socks_proxy
- [[04. Chisel|Chisel]] — SOCKS over HTTP(S) — the modern go-to
- [[05. Sshuttle|Sshuttle]] — "poor man's VPN" via SSH
- [[06. Socat & Rpivot|Socat & Rpivot]] — port redirection and HTTP CONNECT pivots
- [[07. Windows Port Forwarding|Windows Port Forwarding]] — netsh portproxy, plink, SocksOverRDP
- [[08. DNS Tunneling|DNS Tunneling]] — dnscat2, dns2tcp, iodine
- [[09. ICMP Tunneling|ICMP Tunneling]] — ptunnel, icmpsh when everything else is blocked
- [[10. Detection & Prevention|Detection & Prevention]] — defender's view: baselines, egress filtering, SIEM detections
