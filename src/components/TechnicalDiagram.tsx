/** Editable, accessible diagrams; positions and moving packets derive only from t. */
export function TechnicalDiagram({scene,text,time,reduced}:{scene:number;text:string;time:number;reduced:boolean}){
 const lower=text.toLowerCase();
 let labels:string[]=[];let title='';
 if(scene===3){title=lower.includes('buffer')?'Unchecked input crosses a memory boundary':lower.includes('virus')?'Virus and worm are different':'A trusted-looking program abuses granted access';labels=lower.includes('buffer')?['Input','Fixed buffer','Overflow','Corrupted memory']:lower.includes('virus')?['Virus','Host program','Program runs','Spread']:['Fake update','User permissions','Trojan','Spyware / backdoor'];}
 if(scene===4){title='Distributed traffic overwhelms one public service';labels=['Compromised hosts','Botnet','Public gateway','Service timeout'];}
 if(scene===6){title=lower.includes('false')||lower.includes('detection')?'Detection is evidence to investigate':'Defense in depth breaks the attack chain';labels=lower.includes('false')?['Innocent + alert','False positive','Attack + no alert','False negative']:['Policy','Least privilege','Detection','Clean backups'];}
 if(scene===7){title='Filtering is a boundary control, not a complete defense';labels=['Untrusted network','Firewall rules','Allowed traffic','Segmented vault'];}
 if(scene===8){title='Coordinated containment and partial recovery';labels=['Isolate service','Revoke credentials','Upstream mitigation','Standby services'];}
 if(!labels.length)return null;
 const phase=reduced?.5:(time*.3)%1;
 return <svg className="technical-flow" viewBox="0 0 1000 200" role="img" aria-label={title}>
  <title>{title}</title><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#32e2f4"/></marker></defs>
  <path d="M115 80H880" stroke="#32e2f4" strokeWidth="5" markerEnd="url(#arrow)"/>
  {labels.map((label,i)=><g key={label}><rect x={15+i*245} y="43" width="225" height="76" fill="#101a34" stroke={i===3?'#ffe64a':'#32e2f4'} strokeWidth="4"/><text x={127+i*245} y="88" textAnchor="middle" fill="#fff7df" fontSize="21" fontFamily="Barlow, Arial" fontWeight="700">{label}</text></g>)}
  <circle cx={20+phase*950} cy="25" r="6" fill="#ff3a9b"/><text x="500" y="165" textAnchor="middle" fill="#ffe64a" fontSize="23" fontFamily="Barlow, Arial">{title}</text>
 </svg>;
}
