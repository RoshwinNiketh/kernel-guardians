import metrics from './art-metrics.json' with {type:'json'};
export interface ArtMetric {file:string;width:number;height:number;anchorX:number;footY:number;top:number;bodyHeight:number;sha256:string;transparentFraction:number}
export const artMetrics:Record<string,ArtMetric>=metrics;
export const environmentArt={city:'/assets/backgrounds/city_panorama.png',command:'/assets/cinematic/environments/command-center.png',street:'/assets/backgrounds/program_street.webp',gateway:'/assets/cinematic/environments/gateway.png',apartment:'/assets/cinematic/environments/mira-apartment.png',dawn:'/assets/cinematic/environments/city-dawn.png'};
export function actorArt(actor:string,pose:string){const art=artMetrics[`${actor}/${pose}`];if(!art)throw Error(`Unmapped actor pose ${actor}/${pose}`);return art;}
export const cinematicImages=[...new Set([...Object.values(artMetrics).map(a=>a.file),...Object.values(environmentArt),'/assets/cinematic/props/crt-television.png',...['security_shield','data_folder','encrypted_lock','server_rack','malware_icon','terminal','computer_chip'].map(name=>`/assets/props/${name}.png`)])];
