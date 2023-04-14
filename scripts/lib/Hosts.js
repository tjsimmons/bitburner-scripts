import HostType from "/scripts/lib/HostType";

/** @param {import("../..").NS} ns */
export const Rooted = (ns) => {
  let rootedServers = [];
  let walked = ["home"];
  let types = [HostType.Weaken, HostType.Grow, HostType.Hack];

  for (const target of ns
    .scan("home")
    .filter((host) => walked.indexOf(host) === -1)) {
    walked.push(target);

    const haveRoot = ns.hasRootAccess(target);

    if (haveRoot) {
      const currentType = types.shift();

      const maxRam = ns.getServerMaxRam(target);

      ns.tprint(`${target} - ${currentType}`);

      rootedServers.push({
        name: target,
        ram: maxRam,
        type: currentType,
      });

      types.push(currentType);
    }
  }

  return rootedServers;
};

/** @param {import("../..").NS} ns */
export const Personal = (ns) => {
  let servers = [];
  let types = [HostType.Weaken, HostType.Grow, HostType.Hack];

  for (const server of ns.getPurchasedServers()) {
    const maxRam = ns.getServerMaxRam(server);
    const currentType = types.shift();

    ns.tprint(`${server} - ${currentType}`);

    servers.push({ name: server, ram: maxRam, type: currentType });

    types.push(currentType);
  }

  return servers;
};
[
  /*{ name: "serv-0", ram: 32768, type: HostType.WeakenGrowHack },
  { name: "serv-1", ram: 32768, type: HostType.WeakenGrowHack },
  { name: "serv-2", ram: 8192, type: HostType.WeakenGrowHack },
  { name: "serv-3", ram: 1024, type: HostType.WeakenGrowHack },
  { name: "serv-4", ram: 1024, type: HostType.WeakenGrowHack },
  { name: "serv-5", ram: 1024, type: HostType.WeakenGrowHack },
  { name: "serv-6", ram: 1024, type: HostType.WeakenGrowHack },*/
];

export const All = (ns) => Rooted(ns).concat(Personal(ns));

export default All;
