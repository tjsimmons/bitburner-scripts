const mainPath = "/scripts/threaded/main.js";
const threads = 1;
const sleepDelay = 500;
const disabled = -1;

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const paths = [
    "/scripts/weaken.js",
    "/scripts/grow.js",
    "/scripts/hack.js",
    mainPath,
  ];

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
  const rooted = [
    "foodnstuff", // 16gb (12.15 usable)
    "sigma-cosmetics", // 16gb (12.15 usable)
    "joesguns", // 16gb (12.15 usable)
    "hong-fang-tea", // 16gb (12.15 usable)
    "harakiri-sushi", // 16gb (12.15 usable)
    "nectar-net", // 16gb (12.15 usable)
    // 72.9
    "zer0", // 32gb (28.15 usable)
    "iron-gym", // 32gb (28.15 usable)
    "max-hardware", // 32gb (28.15 usable)
    "neo-net", // 32gb (28.15 usable)
    "phantasy", // 32gb (28.15 usable)
    "omega-net", // 32gb (28.15 usable)
    // 168.9
    "silver-helix", // 64gb (60.15 usable)
    // 60.15
  ];

  const owned = [
    "serv-0", // 64gb (60.15 usable)
    "serv-1", // 16gb (12.15 usable)
    "serv-2", // 16gb (12.15 usable)
  ];

  const usable = rooted.concat(owned);

  // total: 386.40
  // foodnstuff, sigma, serv-1 = weaken (18 threads / 9%)
  // silver, serv-2 = hack (38 threads / 19%)
  // the rest = grow (142 threads / 72%)

  const weakenServers = ["foodnstuff", "sigma-cosmetics", "serv-0"];
  const hackServers = ["silver-helix", "serv-1"];
  const growServers = usable
    .filter((u) => weakenServers.indexOf(u) === -1)
    .filter((u) => hackServers.indexOf(u) === -1);

  const weakenPad = 0;
  const growMaxPercent = 100;
  const hackStopPercent = 25;

  // prepare the servers
  usable.map((u) => {
    ns.killall(u);

    paths.map((file) => ns.scp(file, u, "home"));
  });

  for (const host of weakenServers) {
    await startWeaken(ns, host, target, weakenPad);
  }

  for (const host of growServers) {
    await startGrow(ns, host, target, growMaxPercent);
  }

  for (const host of hackServers) {
    await startHack(ns, host, target, hackStopPercent);
  }
}

/** @param {import("../..").NS} ns */
const startWeaken = async (ns, host, target, weakenPad) => {
  ns.toast(`${host} starting main for weaken`);
  ns.exec(mainPath, host, threads, target, weakenPad, disabled, disabled);
  await ns.sleep(sleepDelay);
};

/** @param {import("../..").NS} ns */
const startGrow = async (ns, host, target, growMaxPercent) => {
  ns.toast(`${host} starting main for grow`);
  ns.exec(mainPath, host, threads, target, disabled, growMaxPercent, disabled);
  await ns.sleep(sleepDelay);
};

/** @param {import("../..").NS} ns */
const startHack = async (ns, host, target, hackStopPercent) => {
  ns.toast(`${host} starting main for hack`);
  ns.exec(mainPath, host, threads, target, disabled, disabled, hackStopPercent);
  await ns.sleep(sleepDelay);
};
