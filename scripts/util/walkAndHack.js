let walked = [];

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const hostname = ns.getHostname();

  walkAndHack(ns, hostname);
}

/** @param {import("../..").NS} ns */
const walkAndHack = (ns, hostname) => {
  ns.toast(`Walking from ${hostname}`);

  walked.push(hostname);

  for (const target of ns
    .scan(hostname)
    .filter((host) => walked.indexOf(host) === -1)) {
    let portsOpen = 0;
    const reqHacking = ns.getServerRequiredHackingLevel(target);
    const haveRoot = ns.hasRootAccess(target);

    if (ns.getHackingLevel() >= reqHacking && !haveRoot) {
      ns.toast(`Attempting to own ${target}`, "info");

      if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
        portsOpen++;
      }

      if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(target);
        portsOpen++;
      }

      if (portsOpen >= ns.getServerNumPortsRequired(target)) {
        ns.toast(`Nuking ${target}`, "success", 5000);
        ns.nuke(target);
      }
    }

    walkAndHack(ns, target);
  }
};
