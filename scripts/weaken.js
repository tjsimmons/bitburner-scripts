/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const minWeakenPad = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (minWeakenPad === undefined) {
    ns.toast("minWeakenPad must be passed as an argument", "error", 3000);
    return;
  }

  const minSecLevel = ns.getServerMinSecurityLevel(target) + minWeakenPad;
  let currentSecLevel = ns.getServerSecurityLevel(target);
  let weakenDidRun = false;

  while (currentSecLevel > minSecLevel) {
    ns.toast(
      `Weakening ${target} security: ${currentSecLevel.toFixed(
        3
      )} / ${minSecLevel.toFixed(3)}`,
      "info",
      10000
    );

    await ns.weaken(target);

    currentSecLevel = ns.getServerSecurityLevel(target);

    if (!weakenDidRun) {
      weakenDidRun = true;
    }
  }

  if (weakenDidRun) {
    ns.toast(
      `${target} reached desired security level ${minSecLevel.toFixed(3)}`,
      "success",
      10000
    );
  }
}
