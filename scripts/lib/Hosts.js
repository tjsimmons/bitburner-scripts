export const Rooted = [
  { name: "foodnstuff", ram: 16, type: HostType.Hack },
  { name: "sigma-cosmetics", ram: 16, type: HostType.Hack },
  { name: "joesguns", ram: 16, type: HostType.Hack },
  { name: "hong-fang-tea", ram: 16, type: HostType.Hack },
  { name: "harakiri-sushi", ram: 16, type: HostType.Hack },
  { name: "nectar-net", ram: 16, type: HostType.Hack },
  { name: "zer0", ram: 32, type: HostType.Hack },
  { name: "iron-gym", ram: 32, type: HostType.Hack },
  { name: "max-hardware", ram: 32, type: HostType.Hack },
  { name: "neo-net", ram: 32, type: HostType.Hack },
  { name: "phantasy", ram: 32, type: HostType.Hack },
  { name: "omega-net", ram: 32, type: HostType.Hack },
  { name: "silver-helix", ram: 64, type: HostType.Weaken },
  { name: "avmnite-02h", ram: 128, type: HostType.WeakenHack },
];

export const Personal = [
  { name: "serv-0", ram: 32768, type: HostType.WeakenGrowHack },
  { name: "serv-1", ram: 16, type: HostType.Weaken },
  { name: "serv-2", ram: 16, type: HostType.Weaken },
];

export const All = Rooted.concat(Personal);

export default All;
