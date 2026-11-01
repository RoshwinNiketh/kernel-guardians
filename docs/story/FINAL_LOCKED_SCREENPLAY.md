# KERNEL GUARDIANS
## EIGHT MINUTES TO BLACKOUT

**Finalized screenplay — casting-corrected production copy**  
**Target running time:** approximately 9:05, including action beats and a 50-second debrief. The fictional 8:00 countdown begins at 00:15 and reaches zero at 08:15. These timings are editorial targets, not verified audio durations.  
**Scope:** The Security Problem; Program Threats; System and Network Threats; Implementing Security Defenses; Firewalling to Protect Systems and Networks; Computer-Security Classifications. The cost-of-insecurity scene and final response bridge these six topics.

### Cast and performance
- **COMMANDER KERNEL (Grady):** Serious, calm, authoritative, strategic commander. Minimal dry reaction, no deliberate comic-relief role.
- **AGENT PATCH (Juno):** Fast-thinking investigator and principal technical problem-solver.
- **CAPTAIN FIREWALL (John):** Gruff, relaxed, sarcastic and casually funny, but serious when the situation demands responsibility.
- **VEX NULL (Reid):** Calm, menacing attacker. Never sounds cartoonishly frantic.
- **MIRA VALE (Ginger):** Civilian; personal consequences of a system failure.
- **DR. ELARA TRACE (Talia):** Missing researcher heard through damaged archived messages.
- **AUDITOR AXIOM (Cillian):** Precise, measured evaluator.
- **NARRATOR (Fraser):** Restrained cinematic storytelling, leaving room for visual action.

---

## SCENE 1 — THE MESSAGE (00:00–00:15)
**Visual:** Parallax aerial shot of OS City's illuminated towers, file vault and network bridges. The city's CPU tower pulses; abrupt blackout in one district. A black-and-magenta transmission covers the skyline.

**NARRATOR (warm, then ominous):** OS City. Millions of processes, files and connections, all working together. Tonight, someone wants it to stop.

**VEX NULL (through public broadcast, soft):** Eight minutes until everything goes dark.

**ON SCREEN:** COUNTDOWN 08:00. It begins at 00:15 and runs continuously.

## SCENE 2 — WHAT IS AT STAKE? / THE SECURITY PROBLEM (00:15–01:05)
**Visual:** Kernel strides into Command Central, serious and focused; Patch pulls up three glowing columns marked CONFIDENTIALITY, INTEGRITY and AVAILABILITY. Citizen activity continues in the background.

**KERNEL (serious):** Patch, status report. How long until the attack reaches the core?

**FIREWALL (over comms, amused):** Eight minutes? Perfect. I was just about to take a break.

**PATCH:** Commander, he is targeting the system itself. We need to protect three things: confidentiality, integrity and availability.

**KERNEL:** In plain language?

**PATCH:** Confidentiality means strangers cannot read private data. Integrity means nobody changes it without permission. Availability means legitimate users can still reach their services.

**NARRATOR:** A threat is a possible security violation. An attack is the attempt to make it happen. Stolen information, altered records and denied services are different ways to break trust.

**VEX NULL (interrupting):** Why choose one, Commander? I'll take all three.

**KERNEL:** Patch, trace that signal. Firewall, watch the entrances.

## SCENE 3 — THE GIFT / PROGRAM THREATS (01:05–02:25)
**Visual:** In the Program District, a smiling “FREE SYSTEM OPTIMIZER” update icon appears. The cheerful shell peels away to reveal malicious code. A line on the display reads: RUNNING WITH USER PERMISSIONS.

**MIRA (over emergency call):** A system helper asked me to update. I clicked it, and my files started disappearing!

**PATCH:** That was a Trojan horse: a program that looks useful but secretly abuses the access you give it. The update installed spyware to collect information and a hidden trapdoor for later access.

**VEX NULL (amused):** Such polite citizens. They open the door themselves.

**KERNEL:** An invitation to one room isn't permission to own the building.

**NARRATOR:** Malware can steal data, corrupt programs or lock files. Ransomware encrypts files and demands payment. A logic bomb waits for a trigger before acting.

**Visual:** Tiny red fragments attach to executable icons. Patch isolates one in a diagnostic hologram, showing a separate VIRUS specimen.

**PATCH:** And that's a virus: code that attaches to a host program and can spread when the infected program runs. It isn't the same as a standalone worm.

**Visual:** A vulnerable buffer graphic overflows its boundary. A warning flashes: MEMORY CORRUPTION.

**PATCH:** There's another weakness: unchecked input can overflow a buffer and corrupt memory. If exploitable, that can let malicious code take control of a process.

**KERNEL:** Then we limit every program to the permissions it actually needs. First, contain that Trojan.

**SFX:** Isolating energy ring. One tower recovers, while network bridges flash red.

## SCENE 4 — OUTSIDE THE GATES / SYSTEM AND NETWORK THREATS (02:25–03:45)
**Visual:** Network map. Rapid probes light up exposed ports. A worm slips from one vulnerable host to another; a cloud of compromised machines forms a botnet.

**PATCH:** The attacker scanned our ports to find listening services. Now a worm is exploiting a vulnerable network service and copying itself between machines.

**KERNEL:** Unlike that virus, the worm doesn't need to hide inside another program.

**NARRATOR:** A worm is a standalone, self-propagating program. Port scanning can be legitimate testing, but attackers use it to discover exposed services.

**VEX NULL:** And those machines are no longer taking orders from their owners.

**Visual:** Hundreds of distant devices turn toward OS City. Requests flood the public gateway; ordinary citizens' connections time out.

**FIREWALL (lightly):** Wow. Busy night. Did everyone decide to visit at once?

**PATCH:** It's a botnet. Thousands of compromised systems sending traffic together. A distributed denial-of-service attack is overwhelming our service.

**FIREWALL (tone changes):** Right. That's not a crowd. That's a flood.

**NARRATOR:** Attackers may also masquerade as trusted users, replay captured messages, intercept communications or hijack sessions. A network address alone is not proof of identity.

**KERNEL:** Keep the public service separated from critical systems. We cannot let a traffic flood become a citywide collapse.

## SCENE 5 — THE PEOPLE BEHIND THE FILES (03:45–04:35)
**Visual:** Mira kneels at a dark apartment terminal. Family images display padlocks; a hospital appointment portal times out. Patch receives an old corrupted transmission marked E. TRACE — RECOVERED ARCHIVE.

**MIRA (holding back tears):** My documents are locked. The emergency portal won't load. I thought it was just an update. How could one click do this?

**PATCH (gently):** You were deceived. But the system should also limit how much damage one program can cause.

**ELARA (recording; filtered, with brief static):** If you're watching this, check the trusted update service. I found a hidden maintenance task opening a backdoor. My alerts vanished before I could report it.

**Visual:** Tape glitches. A red arrow connects the Trojan, stolen credentials, and a privileged maintenance task.

**KERNEL (quiet):** So it wasn't only the fake update. Someone exploited the trust behind it.

**NARRATOR:** Security fails at its weakest link: people, programs, operating systems and networks must all be considered.

## SCENE 6 — PATCH'S PLAN / IMPLEMENTING SECURITY DEFENSES (04:35–05:50)
**Visual:** Security Operations Center; split-screen of logs, privileges, endpoint isolation and backup vault. Patch highlights the attack chain instead of merely punching a villain.

**PATCH:** Elara's clue fits the audit logs. Our security policy says who may access the vault. The compromised update service has permissions it shouldn't need.

**KERNEL:** And a vulnerability assessment tells us where the real system falls short of that policy.

**PATCH:** Exactly. Isolate infected hosts. Disable the exposed service. Revoke the stolen credentials, patch the flaw, and enforce least privilege.

**NARRATOR:** Defense in depth uses several controls, because no single defense is perfect.

**PATCH:** Our intrusion detection system has two approaches: signatures recognize known attack patterns; anomaly detection flags unusual behavior, including some previously unseen attacks.

**FIREWALL (over comms):** And sometimes it screams at a perfectly innocent packet. Charming personality.

**PATCH:** That's a false positive. Missing a real attack is a false negative. Alerts need investigation, not blind trust.

**KERNEL:** Antivirus scans, sandboxing, logging and audits help us detect and contain threats. Clean, protected backups help us recover. No magic fix. Just layers that work together.

**Visual:** A green shield grows in layers. Countdown continues; the public gateway remains under attack.

## SCENE 7 — THE GATEKEEPER / FIREWALLING (05:50–06:55)
**Visual:** Captain Firewall at the giant orange gateway. Animated packets approach two paths: permitted and blocked. A second panel shows personal and application-level filtering.

**FIREWALL (grinning):** Welcome to my gate. I check traffic against the rules: allowed through, everyone else gets the scenic route home.

**PATCH:** A network firewall separates trusted and untrusted networks. A personal firewall controls traffic on an individual computer.

**FIREWALL:** Application proxies can understand specific protocols, and system-call filters can restrict what operations programs request. Different tools, different jobs.

**VEX NULL (over the intercom):** And what if my attack travels inside a connection you already allow?

**Visual:** An apparently approved tunnel carries hostile payloads. An identity label briefly flickers to show spoofing.

**FIREWALL (drops the joke):** Then my rules might not recognize the danger. Tunneling and spoofing can complicate filtering. I can't promise to stop every malicious action just because it crosses my gate.

**PATCH:** That's why the internal systems need their own defenses. Keep the critical vault segmented while I close the backdoor.

**FIREWALL:** Consider it done. Gate is holding. For now.

## SCENE 8 — THE LAST PACKET / COORDINATED RESPONSE (06:55–08:15)
**Visual:** Fast cross-cut montage: botnet floods, Mira's frozen screen, Elara's maintenance-task clue, Patch at the console, Kernel directing response, Firewall protecting the network boundary. Timer shows 01:20.

**VEX NULL:** You're blocking packets while my code is already inside. The clock doesn't care how brave you are.

**PATCH:** He is right about one thing. The backdoor runs through the trusted update process. Firewall can't repair that from outside.

**KERNEL (focused):** Then we repair it from inside. Patch, isolate and disable the compromised service. Rotate the stolen credentials. Firewall, maintain the boundary and throttle the flood upstream where possible.

**FIREWALL:** On it. And for the record, I was really looking forward to that break.

**NARRATOR:** The team contains the infected machines, closes the unauthorized access path and coordinates traffic defenses with the network operator. Meanwhile, verified clean backups are readied for recovery.

**VEX NULL (losing patience):** You can't reverse everything I've done!

**PATCH:** Not instantly. But we can stop the damage, investigate it, and restore what we can from clean backups.

**Visual:** Timer 00:10. Ten silent, tense seconds are conveyed with rapid cuts, alarms and the clock, not spoken numbers. At 00:01, public services switch to an isolated standby path. The timer freezes at 00:00, but the CITY STATUS changes to ESSENTIAL SERVICES AVAILABLE.

**MIRA (relieved):** The portal's back. And my files?

**KERNEL:** Recovery is still underway. We're not calling this a victory until we've checked what survived and what changed.

**VEX NULL:** This isn't over.

**KERNEL (composed):** Then we'll be ready. Maintain monitoring and protect the backups.

**FIREWALL (wry):** Good. Because I'm not doing this twice before dinner.

## SCENE 9 — THE AFTER-ACTION REVIEW / COMPUTER-SECURITY CLASSIFICATIONS (08:15–09:05)
**Visual:** Dawn over OS City. Axiom appears as a holographic auditor. Four ascending historic panels read D, C, B, A; detail tags show C1/C2 and B1/B2/B3. Behind them, the defenders continue repairing the city.

**AXIOM (precise):** One final lesson: evaluating system security is not the same as stopping an attack. The historical Trusted Computer System Evaluation Criteria, or TCSEC, used four divisions.

**AXIOM:** D meant minimal evaluated protection. C introduced discretionary protection: C1 provided basic controls; C2 strengthened individual access control and auditing. B added mandatory protection and sensitivity labels, with increasing requirements from B1 through B3. A required formal design and verification for the highest assurance.

**PATCH:** Those are historical evaluation classes, not a modern guarantee that software cannot be breached.

**NARRATOR:** OS City survives through careful design, detection, firewalls, least privilege, patched systems and prepared recovery.

**FIREWALL (back to playful):** And a very handsome gatekeeper.

**KERNEL (dryly):** Don't push it.

**ON SCREEN:** KERNEL GUARDIANS — SECURITY IS A CONTINUOUS PROCESS. END.

---

## Production notes
- The visual timer must follow the *single master story clock*. Seeking, pausing and playback-speed changes must update its display consistently. The fictional eight-minute countdown covers 00:15 through 08:15.
- Dialogue cues, entrances, effects, titles, and on-screen overlays are separate editable layers. Voice generation happens only after the text and characterization are approved.
- Keep audio direction annotations outside the spoken TTS text. Treat all scene windows as estimates until real recording durations are measured.
- Elara's recovered message is an archival recording, not a depiction or assertion of a death. Mira is a civilian with specific consequences, not just a generic distressed voice.
- The climax **contains** the damage; it doesn't imply malware, encryption, corrupted files or DDoS traffic can be magically undone by a firewall or a button.
- TCSEC is historical and appears as a retrospective educational debrief, not a tool for real-time incident response.
- The six assigned topics are primary. Cryptography and user authentication are supporting details, not independent chapters.

## Casting correction / source control
This production copy preserves the approved story and educational dialogue, changing only the opening/closing exchanges and one callback to place the light comedy with Captain Firewall (John). Commander Kernel (Grady) remains a serious strategic commander. This file supersedes older pilot scripts and older expansion dialogue.
