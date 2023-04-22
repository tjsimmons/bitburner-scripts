import HostType from "/scripts/lib/HostType";
import {
  AllHostsAssigned as AllHosts,
  sortDescending,
} from "/scripts/lib/Hosts";

const mainPath = "/scripts/threaded/main.js";
const threads = 1;
const sleepDelay = 500;
const disabled = -1;

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const targetHacking = ns.args[0] / 100;
  const includeHome = ns.args[1];
  const weakenPad = ns.args[2];
  const growMaxPercent = ns.args[3];
  const hackStopPercent = ns.args[4];
  const minHacknetMoney = ns.args[5];
  const manualTarget = ns.args[6];
  const paths = [
    "/scripts/weaken.js",
    "/scripts/grow.js",
    "/scripts/hack.js",
    "/scripts/lib/Weights.js",
    mainPath,
  ];

  ns.run("/scripts/util/walkAndHack.js");
  await ns.sleep(1000);

  let hosts = AllHosts(ns).filter((host) => host.ram > 4);
  const currentHacking = ns.getHackingLevel();
  let target =
    manualTarget !== undefined
      ? manualTarget
      : hosts
          .filter((host) => host.reqHacking <= currentHacking * targetHacking)
          .sort((a, b) => sortDescending(a.maxMoney, b.maxMoney))
          .shift()?.name;

  // only on resets
  if (target === undefined) {
    target = "n00dles";
  }

  /*const allRam = hosts
    .map((server) => server.ram)
    .reduce((prev, next) => prev + next);*/

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (includeHome) {
    hosts.push({ name: "home", ram: null, type: HostType.Hack });
  }

  const weakenServers = hosts.filter((host) => host.type === HostType.Weaken);
  const growServers = hosts.filter((host) => host.type === HostType.Grow);
  const hackServers = hosts.filter((host) => host.type === HostType.Hack);
  const weakenGrowServers = hosts.filter(
    (host) => host.type === HostType.WeakenGrow
  );
  const weakenHackServers = hosts.filter(
    (host) => host.type === HostType.WeakenHack
  );
  const growHackServers = hosts.filter(
    (host) => host.type === HostType.GrowHack
  );
  const weakenGrowHackServers = hosts.filter(
    (host) => host.type === HostType.WeakenGrowHack
  );

  // prepare the servers
  hosts.map(({ name }) => {
    ns.killall(name, true);

    paths.map((file) => ns.scp(file, name, "home"));
  });

  await ns.sleep(5000);

  if (!ns.isRunning("/scripts/util/hacknet.js", "home", minHacknetMoney)) {
    ns.run("/scripts/util/hacknet.js", 1, minHacknetMoney);
  }

  // start up the auto-hack and auto-share script on home
  if (!includeHome) {
    if (!ns.isRunning("/scripts/util/share.js", "home")) {
      ns.run("/scripts/util/start-share.js", 1, 1);
    }
  }

  ns.tprint(
    `WEAKEN delay ${Math.round(
      ns.getWeakenTime(target) / 1000
    )} GROW delay ${Math.round(
      ns.getGrowTime(target) / 1000
    )} HACK delay ${Math.round(ns.getHackTime(target) / 1000)}`
  );

  for (const { name } of weakenServers) {
    await startScript(ns, name, target, weakenPad, disabled, disabled);
  }

  for (const { name } of growServers) {
    await startScript(ns, name, target, disabled, growMaxPercent, disabled);
  }

  for (const { name } of hackServers) {
    await startScript(ns, name, target, disabled, disabled, hackStopPercent);
  }

  for (const { name } of weakenGrowServers) {
    await startScript(ns, name, target, weakenPad, growMaxPercent, disabled);
  }

  for (const { name } of weakenHackServers) {
    await startScript(ns, name, target, weakenPad, disabled, hackStopPercent);
  }

  for (const { name } of growHackServers) {
    await startScript(
      ns,
      name,
      target,
      disabled,
      growMaxPercent,
      hackStopPercent
    );
  }

  for (const { name } of weakenGrowHackServers) {
    await startScript(
      ns,
      name,
      target,
      weakenPad,
      growMaxPercent,
      hackStopPercent
    );
  }
}

/** @param {import("../..").NS} ns */
const startScript = async (
  ns,
  host,
  target,
  weakenPad,
  growMaxPercent,
  hackStopPercent
) => {
  ns.exec(
    mainPath,
    host,
    threads,
    target,
    weakenPad,
    growMaxPercent,
    hackStopPercent
  );

  await ns.sleep(sleepDelay);
};
