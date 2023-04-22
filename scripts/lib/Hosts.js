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
export const sortAscending = (a, b) => a - b;
export const sortDescending = (a, b) => b - a;

const assignTypes = (ns, servers) => {
  let assignableServers = Array.from(servers).sort((a, b) =>
    sortDescending(a.ram, b.ram)
  );
  //.filter(({ ram }) => ram > 4);
  let tempArray = [];
  let assignedServers = [];

  if (servers.length > 0) {
    const totalRam = servers
      .map((server) => server.ram)
      .reduce((previousRam, ram) => previousRam + ram);

    const weakenRam = totalRam * Weight.Weaken;
    const growRam = totalRam * Weight.Grow;
    const hackRam = totalRam * Weight.Hack;

    // maybe instead of doing it RAM based, we can assign these based on # threads available based on cost
    // i think i want weakenThreads >= growThreads + hackThreads to make sure we stay at min security

    ns.tprint(`Total RAM ${totalRam}GB`);
    ns.tprint(`Weaken RAM ${weakenRam.toFixed(3)}GB`);
    ns.tprint(`Hack RAM ${hackRam.toFixed(3)}GB`);
    ns.tprint(`Grow RAM ${growRam.toFixed(3)}GB`);

    let assignedRam = 0;
    while (assignedRam <= weakenRam && assignableServers.length > 0) {
      const nextServer = assignableServers.shift();

      if (
        nextServer.ram + assignedRam <= weakenRam ||
        assignedServers.length === 0 // always assign at least one
      ) {
        nextServer.type = HostType.Weaken;
        assignedServers.push(nextServer);
        assignedRam += nextServer.ram;
      } else {
        tempArray.push(nextServer);
      }
    }

    ns.tprint(`${assignedRam.toFixed(3)}GB assigned to weaken`);

    assignableServers = Array.from(tempArray).concat(assignableServers);
    tempArray = [];

    let hackAssignedOnce = false;
    assignedRam = 0;
    while (assignedRam <= hackRam && assignableServers.length > 0) {
      const nextServer = assignableServers.shift();

      if (nextServer.ram + assignedRam <= hackRam || !hackAssignedOnce) {
        // always assign one
        nextServer.type = HostType.Hack;
        assignedServers.push(nextServer);
        assignedRam += nextServer.ram;
        hackAssignedOnce = true;
      } else {
        tempArray.push(nextServer);
      }
    }

    ns.tprint(`${assignedRam.toFixed(3)}GB assigned to hack`);

    assignableServers = Array.from(tempArray).concat(assignableServers);

    // the leftover servers get to grow, should be the majority
    assignedRam = 0;
    while (assignableServers.length > 0) {
      const nextServer = assignableServers.shift();

      nextServer.type = HostType.Grow;
      assignedServers.push(nextServer);
      assignedRam += nextServer.ram;
    }

    ns.tprint(`${assignedRam.toFixed(3)}GB assigned to grow`);

    assignedServers.map(({ name, ram, type }) =>
      ns.tprint(`${name} - ${ram}GB - ${type}`)
    );
  }

  return assignedServers;
};

/** @param {import("../..").NS} ns */
const scan = (ns, host, walked, servers) => {
  for (const target of ns.scan(host).filter((h) => walked.indexOf(h) === -1)) {
    walked.push(target);

    const haveRoot = ns.hasRootAccess(target);

    if (haveRoot) {
      const maxRam = ns.getServerMaxRam(target);
      const reqHacking = ns.getServerRequiredHackingLevel(target);
      const maxMoney = ns.getServerMaxMoney(target);

      servers.push({
        name: target,
        ram: maxRam,
        type: null,
        reqHacking: reqHacking,
        maxMoney: maxMoney,
      });
    }

    scan(ns, target, walked, servers);
  }
};

export default All;
