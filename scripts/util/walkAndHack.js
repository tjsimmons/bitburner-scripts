let walked = [];

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const hostname = ns.getHostname();
  walked = ["darkweb"];

  ns.toast("Beginning to walk server tree", "info");
  walkAndHack(ns, hostname);
  ns.toast("Finished walking server tree", "success");
}

/** @param {import("../..").NS} ns */
const walkAndHack = (ns, hostname) => {
  //  ns.tprint(`Walking from ${hostname}`);

  walked.push(hostname);

  for (const target of ns
    .scan(hostname)
    .filter((host) => walked.indexOf(host) === -1)) {
    let portsOpen = 0;
    const reqHacking = ns.getServerRequiredHackingLevel(target);
    const haveRoot = ns.hasRootAccess(target);
    const hackLevel = ns.getHackingLevel();

    if (target === "run4theh111z" || target === "avmnite-02h") {
      ns.tprint(`${target} seen from ${hostname}`);
    }

    if (hackLevel >= reqHacking && !haveRoot) {
      ns.tprint(`Attempting to own ${target}`);

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
        ns.tprint(`Nuking ${target}`);
        ns.nuke(target);
      } else {
        ns.toast(`Not enough open ports ${target}`, "error", 5000);
      }
    }

    walkAndHack(ns, target);
  }
};
