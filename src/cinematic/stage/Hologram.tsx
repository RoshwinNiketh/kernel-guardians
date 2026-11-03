import { cueAt, blackoutAt, climaxStart } from "../timeline/edit";
import type { Shot } from "../timeline/types";
const cyan = "#54e9fa",
  pink = "#ff548e",
  gold = "#ffdf62",
  paper = "#effaff";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
import { propArt } from "./assets";
function Label({
  x,
  y,
  children,
  color = paper,
  size = 25,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={size}
      fontFamily="Barlow,Arial"
      fontWeight="600"
    >
      {children}
    </text>
  );
}
function Link({
  x1,
  y1,
  x2,
  y2,
  color = cyan,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  return (
    <path
      d={`M${x1} ${y1}L${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth="4"
      markerEnd="url(#concept-arrow)"
    />
  );
}
function Image({
  name,
  x,
  y,
  w = 130,
  h = 150,
}: {
  name: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <image
      href={propArt(name)}
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
export function Hologram({
  shot,
  time,
  reduced,
}: {
  shot: Shot;
  time: number;
  reduced: boolean;
}) {
  const id = shot.concept;
  if (id === "none") return null;
  const cue = cueAt(time),
    p = cue
      ? clamp((time - cue.start) / cue.duration)
      : clamp((time - shot.start) / (shot.end - shot.start));
  const phase = reduced ? 0.5 : (time * 0.36) % 1;
  const active = Math.min(2, Math.floor(p * 3));
  let title = "",
    content: React.ReactNode;
  if (id === "cia") {
    title = "What the city must protect";
    const names = ["Confidentiality", "Integrity", "Availability"],
      notes = ["Private data", "Authorized changes", "Legitimate access"];
    content = (
      <>
        {["encrypted_lock", "data_folder", "server_rack"].map((name, i) => (
          <g key={name} opacity={i <= active ? 1 : 0.24}>
            <path
              d={`M${200 + i * 300} 55l110 45v135q0 65-110 105q-110-40-110-105V100Z`}
              fill="#0b2038"
              stroke={i === active ? gold : cyan}
              strokeWidth="3"
            />
            <Image name={name} x={200 + i * 300} y={182} />
            <Label
              x={200 + i * 300}
              y={385}
              color={i === active ? gold : paper}
            >
              {names[i]}
            </Label>
            <Label x={200 + i * 300} y={420} size={21}>
              {notes[i]}
            </Label>
          </g>
        ))}
      </>
    );
  } else if (id === "threat") {
    title = "Potential is different from an attempt";
    content = (
      <>
        <Image name="warning_sign" x={225} y={175} w={150} />
        <Label x={225} y={310} color={gold} size={35}>
          THREAT
        </Label>
        <Label x={225} y={350}>
          A possible violation
        </Label>
        <Link x1={350} y1={180} x2={625} y2={180} color={pink} />
        <circle cx={360 + phase * 240} cy="180" r="9" fill={pink} />
        <Image name="security_shield" x={775} y={175} w={145} />
        <Label x={775} y={310} color={pink} size={35}>
          ATTACK
        </Label>
        <Label x={775} y={350}>
          An attempt to violate security
        </Label>
      </>
    );
  } else if (id === "updater" || id === "trojan") {
    title =
      id === "updater"
        ? "An update that asks for trust"
        : "The gift conceals a second purpose";
    content = (
      <>
        <rect
          x="150"
          y="65"
          width="700"
          height="345"
          rx="12"
          fill="#0c2036"
          stroke={cyan}
          strokeWidth="4"
        />
        <path d="M150 112H850" stroke={cyan} strokeWidth="2" />
        <Label x={500} y={98} size={23}>
          FREE SYSTEM OPTIMIZER
        </Label>
        <g
          transform={`translate(${id === "trojan" ? -p * 170 : 0} 0)`}
          opacity={id === "trojan" ? 1 - p * 0.75 : 1}
        >
          <Image name="data_folder" x={500} y={230} w={200} h={170} />
        </g>
        {id === "trojan" && (
          <g opacity={clamp(p * 3)}>
            <Image name="malware_icon" x={540} y={225} w={170} />
            <Label x={500} y={350} color={pink}>
              Spyware + hidden trapdoor
            </Label>
          </g>
        )}
        {id === "updater" && (
          <>
            <rect x="350" y="325" width="300" height="52" fill={gold} />
            <Label x={500} y={360} color="#081022">
              INSTALL UPDATE
            </Label>
          </>
        )}
        <Label x={500} y={455} color={gold} size={23}>
          RUNNING WITH USER PERMISSIONS
        </Label>
      </>
    );
  } else if (id === "malware") {
    const mode = Math.min(2, Math.floor(p * 3));
    title = [
      "Information leaves the system",
      "Files become unreadable",
      "A hidden task waits for a trigger",
    ][mode];
    content = (
      <>
        <Image name="data_folder" x={280} y={210} w={210} h={220} />
        <Image
          name={
            mode === 0
              ? "hologram_analytics"
              : mode === 1
                ? "encrypted_lock"
                : "warning_sign"
          }
          x={680}
          y={210}
          w={180}
        />
        <Link x1={420} y1={210} x2={555} y2={210} color={pink} />
        <Label x={500} y={385} color={pink} size={36}>
          {["Data theft", "Ransomware", "Logic bomb"][mode]}
        </Label>
        <Label x={500} y={430}>
          {
            [
              "Private information disclosed",
              "Encryption followed by a payment demand",
              "A trigger activates malicious behavior",
            ][mode]
          }
        </Label>
      </>
    );
  } else if (id === "virus" || id === "worm") {
    title =
      id === "virus"
        ? "A virus needs its host"
        : "A worm propagates independently";
    content = (
      <>
        <path d="M500 40V420" stroke={cyan} opacity=".35" strokeWidth="2" />
        <Image name="computer_chip" x={240} y={180} w={200} />
        <Image name="malware_icon" x={295} y={200} w={80} h={80} />
        <Label x={240} y={330} color={id === "virus" ? gold : paper} size={34}>
          VIRUS
        </Label>
        <Label x={240} y={370} size={22}>
          Attached to a host program
        </Label>
        <Label x={240} y={405} size={20}>
          Runs when the infected host runs
        </Label>
        <Image name="server_rack" x={630} y={175} w={100} />
        <Image name="server_rack" x={855} y={175} w={100} />
        <Link x1={705} y1={170} x2={780} y2={170} color={pink} />
        <circle cx={710 + phase * 65} cy="170" r="8" fill={pink} />
        <Label x={750} y={330} color={id === "worm" ? gold : paper} size={34}>
          WORM
        </Label>
        <Label x={750} y={370} size={22}>
          Standalone, self-propagating
        </Label>
        <Label x={750} y={405} size={20}>
          Copies between vulnerable hosts
        </Label>
      </>
    );
  } else if (id === "buffer") {
    title = "Unchecked input can corrupt memory";
    const filled = Math.min(10, Math.floor(p * 12));
    content = (
      <>
        <Label x={500} y={85} color={gold}>
          INPUT → FIXED-SIZE BUFFER
        </Label>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect
              x={60 + i * 90}
              y="145"
              width="79"
              height="115"
              fill={i < filled ? (i < 7 ? "#15556e" : "#801d50") : "#10283b"}
              stroke={i < 7 ? cyan : pink}
              strokeWidth="3"
            />
            {i < filled && (
              <Label x={100 + i * 90} y={213} color={i < 7 ? paper : pink}>
                {i < 7 ? "DATA" : "!"}
              </Label>
            )}
          </g>
        ))}
        <path
          d="M685 110V300"
          stroke={gold}
          strokeWidth="6"
          strokeDasharray="9 8"
        />
        <Label x={365} y={335}>
          Allocated buffer
        </Label>
        <Label x={820} y={335} color={pink}>
          Beyond the boundary
        </Label>
        <Label x={500} y={415} color={pink} size={31}>
          MEMORY CORRUPTION ≠ PERMISSION
        </Label>
      </>
    );
  } else if (id === "ports") {
    title = "Discover the listening services";
    content = (
      <>
        <Image name="server_rack" x={180} y={215} w={150} h={240} />
        {["22", "80", "443"].map((port, i) => (
          <g key={port}>
            <path
              d={`M270 215Q420 ${80 + i * 110} 630 ${100 + i * 110}`}
              fill="none"
              stroke={i === Math.floor(phase * 3) ? gold : cyan}
              strokeWidth="3"
            />
            <rect
              x="650"
              y={65 + i * 110}
              width="180"
              height="65"
              fill="#10283b"
              stroke={cyan}
              strokeWidth="3"
            />
            <Label x={740} y={107 + i * 110}>
              Port {port}
            </Label>
          </g>
        ))}
        <Label x={500} y={455} color={gold} size={24}>
          Scanning can be legitimate testing or attacker reconnaissance
        </Label>
      </>
    );
  } else if (id === "botnet") {
    title = "Many compromised systems. One overwhelmed service.";
    content = (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4,
            x = 500 + Math.cos(a) * 345,
            y = 220 + Math.sin(a) * 160;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y}L500 220`}
                stroke={pink}
                opacity=".6"
                strokeWidth="3"
              />
              <Image name="computer_chip" x={x} y={y} w={90} h={70} />
              <circle
                cx={x + (500 - x) * phase}
                cy={y + (220 - y) * phase}
                r="5"
                fill={pink}
              />
            </g>
          );
        })}
        <Image name="security_shield" x={500} y={220} w={150} />
        <Label x={500} y={445} color={pink} size={30}>
          DDoS: legitimate users cannot reach the service
        </Label>
      </>
    );
  } else if (id === "identity") {
    title = "An address is not proof of identity";
    content = (
      <>
        <Image name="terminal" x={200} y={205} w={160} />
        <Image name="server_rack" x={800} y={205} w={130} />
        <Link x1={310} y1={205} x2={690} y2={205} />
        <path d="M500 205V90" stroke={pink} strokeWidth="4" />
        <Image name="malware_icon" x={500} y={75} w={90} h={90} />
        <Label x={200} y={345}>
          Claimed identity
        </Label>
        <Label x={500} y={345} color={pink}>
          Replay / intercept / hijack
        </Label>
        <Label x={800} y={345}>
          Verify the session
        </Label>
        <Label x={500} y={420} color={gold}>
          Trust needs more than a network address
        </Label>
      </>
    );
  } else if (id === "chain" || id === "policy" || id === "response") {
    title =
      id === "chain"
        ? "The trust path behind the attack"
        : id === "policy"
          ? "Policy versus actual permissions"
          : "Different defenders. Coordinated actions.";
    const labels =
      id === "chain"
        ? ["Fake update", "Stolen credentials", "Privileged task"]
        : id === "policy"
          ? ["Who may access?", "Actual privilege", "Least privilege"]
          : ["Isolate + revoke", "Upstream mitigation", "Verified recovery"];
    content = (
      <>
        {labels.map((label, i) => (
          <g key={label}>
            <Image
              name={["terminal", "encrypted_lock", "server_rack"][i]}
              x={180 + i * 320}
              y={190}
              w={130}
              h={180}
            />
            <Label
              x={180 + i * 320}
              y={335}
              color={i === active ? gold : paper}
              size={24}
            >
              {label}
            </Label>
            {i < 2 && (
              <Link
                x1={275 + i * 320}
                y1={190}
                x2={395 + i * 320}
                y2={190}
                color={id === "chain" ? pink : cyan}
              />
            )}
          </g>
        ))}
        <Label x={500} y={425} color={gold}>
          {id === "chain"
            ? "The privileged service—not just the deceptive program"
            : id === "policy"
              ? "An assessment finds where the system falls short"
              : "Contain damage before restoring clean services"}
        </Label>
      </>
    );
  } else if (id === "containment" || id === "layers" || id === "backups") {
    title =
      id === "backups"
        ? "Recovery starts with a clean protected copy"
        : id === "layers"
          ? "No single control is perfect"
          : "Break the attack chain";
    content = (
      <>
        <Image
          name={id === "backups" ? "data_folder" : "server_rack"}
          x={500}
          y={210}
          w={150}
          h={190}
        />
        {[155, 205, 255].map((r, i) => (
          <ellipse
            key={i}
            cx="500"
            cy="210"
            rx={r}
            ry={r * 0.6}
            fill="none"
            stroke={i <= active ? cyan : "#24455f"}
            strokeWidth="5"
            strokeDasharray={i === active ? "14 9" : undefined}
            strokeDashoffset={reduced ? 0 : -time * 12}
          />
        ))}
        <Label x={190} y={110} color={gold}>
          Isolate
        </Label>
        <Label x={805} y={110} color={gold}>
          Revoke
        </Label>
        <Label x={190} y={345} color={gold}>
          Patch
        </Label>
        <Label x={805} y={345} color={gold}>
          Verify
        </Label>
        <Label x={500} y={445}>
          {id === "backups"
            ? "Protected backups do not undo all damage instantly"
            : "Policy · least privilege · detection · protected backups"}
        </Label>
      </>
    );
  } else if (id === "ids") {
    const errors = cue?.spoken_text.toLowerCase().includes("false");
    title = errors
      ? "Alerts require investigation"
      : "Two ways to detect suspicious behavior";
    content = (
      <>
        <path d="M500 50V420" stroke={cyan} strokeWidth="2" opacity=".4" />
        {[0, 1].map((i) => (
          <g key={i}>
            <Label
              x={240 + i * 520}
              y={100}
              color={i === active % 2 ? gold : paper}
              size={31}
            >
              {errors
                ? i === 0
                  ? "False positive"
                  : "False negative"
                : i === 0
                  ? "Signature"
                  : "Anomaly"}
            </Label>
            <path
              d={Array.from(
                { length: 60 },
                (_, k) =>
                  `${k ? "L" : "M"}${30 + i * 520 + k * 7} ${220 + Math.sin(k * 0.55) * 25 + (i === 1 && k > 32 && k < 37 ? -95 : 0)}`,
              ).join(" ")}
              fill="none"
              stroke={i ? pink : cyan}
              strokeWidth="4"
            />
            <Label x={240 + i * 520} y={340} size={23}>
              {errors
                ? i === 0
                  ? "Innocent activity + alert"
                  : "Real attack + no alert"
                : i === 0
                  ? "Match a known pattern"
                  : "Flag unusual behavior"}
            </Label>
            <Label x={240 + i * 520} y={385} size={21}>
              {errors
                ? "Investigate evidence, not just the alarm"
                : i === 0
                  ? "Known threats"
                  : "May reveal previously unseen attacks"}
            </Label>
          </g>
        ))}
      </>
    );
  } else if (id === "filter" || id === "proxy" || id === "tunnel") {
    title =
      id === "tunnel"
        ? "Allowed traffic can still carry danger"
        : id === "proxy"
          ? "Different controls inspect different things"
          : "Rules allow one route and reject another";
    content = (
      <>
        <rect
          x="455"
          y="70"
          width="90"
          height="300"
          fill="#703c14"
          stroke={gold}
          strokeWidth="5"
        />
        <Label x={500} y={420} color={gold}>
          {id === "proxy"
            ? "Protocol-aware proxy / system-call restrictions"
            : "Filtering boundary"}
        </Label>
        <path d="M80 145H920" stroke={cyan} strokeWidth="6" />
        <path
          d="M80 290H450l-50-45m50 45l-50 45"
          stroke={pink}
          strokeWidth="6"
          fill="none"
        />
        {Array.from({ length: 8 }, (_, i) => {
          const x = 80 + ((phase + i * 0.13) % 1) * 820;
          return (
            <g key={i}>
              <rect
                x={x}
                y="125"
                width="35"
                height="40"
                fill="#17465b"
                stroke={cyan}
                strokeWidth="3"
              />
              {id === "tunnel" && i === 3 && (
                <path d={`M${x + 17} 132l10 13-10 13-10-13Z`} fill={pink} />
              )}
            </g>
          );
        })}
        <Label x={220} y={80}>
          Untrusted traffic
        </Label>
        <Label x={800} y={80}>
          {id === "tunnel" ? "Concealed payload" : "Allowed path"}
        </Label>
        <Label x={250} y={350} color={pink}>
          Rejected
        </Label>
        <Label x={800} y={350} color={id === "tunnel" ? pink : cyan}>
          {id === "tunnel"
            ? "Internal defenses still needed"
            : "Critical systems remain segmented"}
        </Label>
      </>
    );
  } else if (id === "standby") {
    const ready = time >= blackoutAt;
    title = ready
      ? "Essential services available"
      : "Standby ready. Hold the boundary.";
    content = (
      <>
        <Image name="server_rack" x={240} y={210} w={140} h={210} />
        <Image name="security_shield" x={760} y={210} w={170} />
        <Link x1={350} y1={210} x2={630} y2={210} color={ready ? cyan : gold} />
        <Label x={240} y={365}>
          Verified standby
        </Label>
        <Label x={760} y={365} color={ready ? cyan : gold}>
          {ready ? "ESSENTIAL SERVICES ONLINE" : "SWITCH PATH PREPARED"}
        </Label>
        <Label x={500} y={440} color={gold}>
          {ready
            ? "Files and affected systems still require recovery"
            : "STANDBY VERIFIED · TRANSFER ARMED"}
        </Label>
      </>
    );
  } else {
    title = "Historical TCSEC assurance";
    const classes = ["D", "C1 / C2", "B1 / B2 / B3", "A"];
    const descriptions = [
      "Minimal evaluated protection",
      "Discretionary controls and auditing",
      "Mandatory protection and sensitivity labels",
      "Formal design and verification",
    ];
    const selected = Math.min(3, Math.floor(p * 4));
    content = (
      <>
        {classes.map((c, i) => (
          <g key={c} opacity={i <= selected ? 1 : 0.2}>
            <path
              d={`M100 ${90 + i * 90}H${350 + i * 150}`}
              stroke={i === selected ? gold : cyan}
              strokeWidth="8"
            />
            <Label x={145} y={75 + i * 90} color={gold} size={30}>
              {c}
            </Label>
            <text
              x="325"
              y={75 + i * 90}
              fill={paper}
              fontSize="23"
              fontFamily="Barlow,Arial"
            >
              {descriptions[i]}
            </text>
          </g>
        ))}
        <Label x={500} y={470} color={gold} size={21}>
          Historical evaluation classes—not a modern breach guarantee
        </Label>
      </>
    );
  }
  return (
    <section
      className={`cine-concept concept-${id}`}
      data-concept={id}
      aria-label={title}
    >
      <h2>{title}</h2>
      <svg viewBox="0 0 1000 500" role="img" aria-label={title}>
        <defs>
          <marker
            id="concept-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0L6 3.5L0 7" fill={cyan} />
          </marker>
        </defs>
        {content}
      </svg>
    </section>
  );
}
