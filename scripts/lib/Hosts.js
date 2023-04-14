import HostType from "/scripts/lib/HostType";
import Weight from "/scripts/lib/Weights";

export async function main(ns) {
  return AllHostsAssigned(ns);
}

/** @param {import("../..").NS} ns */
export const All = (ns) => {
  let servers = [];
  let walked = ["home"];

  scan(ns, "home", walked, servers);

  return servers;
};

export const AllHostsAssigned = (ns) => assignTypes(ns, All(ns));

const assignTypes = (ns, servers) => {
  let assignableServers = Array.from(servers)
    .sort((a, b) => a.ram - b.ram)
    .filter(({ ram }) => ram > 4);
  let tempArray = [];
  let assignedServers = [];

  let totalRam = servers
    .map((server) => server.ram)
    .reduce((previousRam, ram) => previousRam + ram);

  const weakenRam = totalRam * Weight.Weaken;
  const growRam = totalRam * Weight.Grow;
  const hackRam = totalRam * Weight.Hack;

  ns.tprint(`Total RAM ${totalRam}GB`);
  ns.tprint(`Weaken RAM ${weakenRam}GB`);
  ns.tprint(`Hack RAM ${hackRam}GB`);
  ns.tprint(`Grow RAM ${growRam}GB`);

  let assignedRam = 0;
  while (assignedRam <= weakenRam && assignableServers.length > 0) {
    const nextServer = assignableServers.shift();

    if (
      nextServer.ram + assignedRam <= weakenRam ||
      assignedServers.length === 0
    ) {
      // always assign at least one
      nextServer.type = HostType.Weaken;
      assignedServers.push(nextServer);
      assignedRam += nextServer.ram;
    } else {
      tempArray.push(nextServer);
    }
  }

  ns.tprint(`${assignedRam}GB assigned to weaken`);

  assignableServers = Array.from(tempArray).concat(assignableServers);
  tempArray = [];

  assignedRam = 0;
  ns.tprint(`Assigned servers length ${assignedServers.length}`);
  ns.tprint(`Assignable servers length ${assignableServers.length}`);
  while (assignedRam <= hackRam && assignableServers.length > 0) {
    const nextServer = assignableServers.shift();

    if (
      nextServer.ram + assignedRam <= hackRam ||
      assignedServers.length === 1
    ) {
      // always assign one
      nextServer.type = HostType.Hack;
      assignedServers.push(nextServer);
      assignedRam += nextServer.ram;
    } else {
      tempArray.push(nextServer);
    }
  }

  ns.tprint(`${assignedRam}GB assigned to hack`);

  assignableServers = Array.from(tempArray).concat(assignableServers);

  // the leftover servers get to grow, should be the majority
  assignedRam = 0;
  while (assignableServers.length > 0) {
    const nextServer = assignableServers.shift();

    nextServer.type = HostType.Grow;
    assignedServers.push(nextServer);
    assignedRam += nextServer.ram;
  }

  ns.tprint(`${assignedRam}GB assigned to grow`);

  assignedServers.map(({ name, ram, type }) =>
    ns.tprint(`${name} - ${ram}GB - ${type}`)
  );

  return assignedServers;
};

const scan = (ns, host, walked, servers) => {
  for (const target of ns.scan(host).filter((h) => walked.indexOf(h) === -1)) {
    walked.push(target);

    const haveRoot = ns.hasRootAccess(target);

    if (haveRoot) {
      const maxRam = ns.getServerMaxRam(target);

      servers.push({
        name: target,
        ram: maxRam,
        type: null,
      });
    }

    scan(ns, target, walked, servers);
  }
};

export default All;
