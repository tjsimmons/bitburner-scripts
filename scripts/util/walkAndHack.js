let walked = [];

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const hostname = ns.getHostname();
  walked = [];

  ns.toast("Beginning to walk server tree", "info");
  walkAndHack(ns, hostname);
  ns.toast("Finished walking server tree", "success");
}

/** @param {import("../..").NS} ns */
const walkAndHack = (ns, hostname) => {
  ns.print(`Walking from ${hostname}`);

  walked.push(hostname);

  for (const target of ns
    .scan(hostname)
    .filter((host) => walked.indexOf(host) === -1)) {
    let portsOpen = 0;
    const reqHacking = ns.getServerRequiredHackingLevel(target);
    const haveRoot = ns.hasRootAccess(target);
    const hackLevel = ns.getHackingLevel();

    ns.toast(
      `${target} req hacking ${reqHacking} / ${hackLevel} rooted ${haveRoot}`
    );

    if (ns.getHackingLevel() >= reqHacking && !haveRoot) {
      ns.toast(`Attempting to own ${target}`, "info", 5000);

      if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
        portsOpen++;
      }

      if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(target);
        portsOpen++;
      }

      if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(target);
        portsOpen++;
      }

      if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(target);
        portsOpen++;
      }

      if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(target);
        portsOpen++;
      }

      if (portsOpen >= ns.getServerNumPortsRequired(target)) {
        ns.toast(`Nuking ${target}`, "success", 5000);
        ns.nuke(target);
      } else {
        ns.toast(`Not enough open ports ${target}`, "error", 5000);
      }
    }

    walkAndHack(ns, target);
  }
};
