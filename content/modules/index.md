---
title: Modules
---

<style>
.mod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:1rem; margin:1.5rem 0; }
.mod-card { display:block; padding:1rem 1.25rem; border:1px solid var(--lightgray); border-radius:10px; text-decoration:none !important; transition:border-color 0.15s, transform 0.15s, box-shadow 0.15s; background:var(--light); }
.mod-card:hover { border-color:#00ff9f; transform:translateY(-2px); box-shadow:0 4px 14px rgba(0,255,159,0.12); }
.mod-card-title { font-weight:600; color:var(--dark); margin-bottom:0.3rem; font-size:0.98rem; }
.mod-card-desc { font-size:0.8rem; color:var(--darkgray); line-height:1.35; }
</style>

> [!tip] How this works
> Each module page has three tabs — **Notes** (humanized explanations), **Cheatsheet** (commands & payloads), and **Checklist** (methodology steps). Checklist progress is saved in your browser.

<div class="mod-grid">

<a class="mod-card" href="./footprinting/"><div class="mod-card-title">Footprinting</div><div class="mod-card-desc">Infrastructure & host-based enumeration</div></a>

<a class="mod-card" href="./information-gathering/"><div class="mod-card-title">Information Gathering</div><div class="mod-card-desc">Passive & active web reconnaissance</div></a>

<a class="mod-card" href="./shells-payloads/"><div class="mod-card-title">Shells & Payloads</div><div class="mod-card-desc">Reverse shells, webshells, msfvenom</div></a>

<a class="mod-card" href="./file-transfer/"><div class="mod-card-title">File Transfer</div><div class="mod-card-desc">Windows, Linux, HTTP, LOL techniques</div></a>

<a class="mod-card" href="./metasploit/"><div class="mod-card-title">Metasploit</div><div class="mod-card-desc">MSF framework, payloads, evasion</div></a>

<a class="mod-card" href="./passwords-attack/"><div class="mod-card-title">Passwords Attack</div><div class="mod-card-desc">Cracking, SAM, LSASS, PtH, PtT</div></a>

<a class="mod-card" href="./attacking-common-services/"><div class="mod-card-title">Attacking Common Services</div><div class="mod-card-desc">FTP, SMB, SQL, RDP, DNS, SMTP</div></a>

<a class="mod-card" href="./pivoting-tunneling/"><div class="mod-card-title">Pivoting & Tunneling</div><div class="mod-card-desc">SSH, Chisel, Socat, Rpivot</div></a>

<a class="mod-card" href="./active-directory/"><div class="mod-card-title">Active Directory</div><div class="mod-card-desc">Enum, Kerberos, ACLs, lateral movement</div></a>

<a class="mod-card" href="./login-brute-forcing/"><div class="mod-card-title">Login Brute Forcing</div><div class="mod-card-desc">Hydra, Medusa, custom wordlists</div></a>

<a class="mod-card" href="./ffuf/"><div class="mod-card-title">Attacking with Ffuf</div><div class="mod-card-desc">Directory, subdomain & parameter fuzzing</div></a>

<a class="mod-card" href="./using-web-proxy/"><div class="mod-card-title">Using Web Proxy</div><div class="mod-card-desc">Burp Suite & ZAP techniques</div></a>

<a class="mod-card" href="./sql-injection/"><div class="mod-card-title">SQL Injection</div><div class="mod-card-desc">In-band, blind, error-based, UNION</div></a>

<a class="mod-card" href="./sqlmap/"><div class="mod-card-title">Using SQLMap</div><div class="mod-card-desc">Automated SQLi detection & exploitation</div></a>

<a class="mod-card" href="./xss/"><div class="mod-card-title">XSS</div><div class="mod-card-desc">Reflected, stored, DOM-based, CSP bypass</div></a>

<a class="mod-card" href="./file-inclusion/"><div class="mod-card-title">File Inclusion</div><div class="mod-card-desc">LFI, RFI, log poisoning, PHP wrappers</div></a>

<a class="mod-card" href="./file-upload/"><div class="mod-card-title">File Upload Attacks</div><div class="mod-card-desc">Extension bypass, MIME, polyglots</div></a>

<a class="mod-card" href="./command-injection/"><div class="mod-card-title">Command Injection</div><div class="mod-card-desc">OS command injection & filter bypass</div></a>

<a class="mod-card" href="./web-attacks/"><div class="mod-card-title">Web Attacks</div><div class="mod-card-desc">IDOR, XXE, SSRF, CSRF, mass assignment</div></a>

<a class="mod-card" href="./attacking-common-apps/"><div class="mod-card-title">Attacking Common Apps</div><div class="mod-card-desc">WordPress, Tomcat, Jenkins, Splunk</div></a>

</div>
