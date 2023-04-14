import HostType from "/scripts/lib/HostType";
import AllHosts from "/scripts/lib/Hosts";

const mainPath = "/scripts/threaded/main.js";
const threads = 1;
const sleepDelay = 500;
const disabled = -1;

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const includeHome = ns.args[1] !== undefined ? ns.args[1] : false;
  const weakenPad = ns.args[2] !== undefined ? ns.args[2] : 0;
  const growMaxPercent = ns.args[3] !== undefined ? ns.args[3] : 100;
  const hackStopPercent = ns.args[4] !== undefined ? ns.args[4] : 25;
  const paths = [
    "/scripts/weaken.js",
    "/scripts/grow.js",
    "/scripts/hack.js",
    mainPath,
  ];

  ns.run("/scripts/util/walkAndHack.js");

  let hosts = AllHosts(ns).filter((host) => host.ram > 4);

  // TODO: add ratio arguments for weaken, grow, hack (.2, .6, .2 to start?)

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  // TODO: automate this - getting servers, finding what I own and the max RAM
  // then calculating the threads available per script on it
  // and run the 3 scripts at desired ratios
  // manager script = 3.85GB
  // weaken = 1.95
  // grow = 1.95
  // hack = 1.9
  if (includeHome) {
    hosts.push({ name: "home", ram: 8, type: HostType.WeakenGrowHack });
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
    ns.killall(name);

    paths.map((file) => ns.scp(file, name, "home"));
  });

  // TODO: sum up the amount of RAM for each type and display it

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
  ns.toast(`${host} starting main for weaken`, "info");
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
