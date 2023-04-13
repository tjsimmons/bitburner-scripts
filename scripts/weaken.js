/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const minSecLevelPad = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (minSecLevelPad === undefined) {
    ns.toast("minSecLevelPad must be passed as an argument", "error", 3000);
    return;
  }

  const minSecLevel = ns.getServerMinSecurityLevel(target) + minSecLevelPad;
  let currentSecLevel = ns.getServerSecurityLevel(target);

  while (currentSecLevel > minSecLevel) {
    ns.toast(
      `Weakening ${target} security: ${currentSecLevel} / ${minSecLevel}`,
      "info",
      10000
    );

    await ns.weaken(target);

    currentSecLevel = ns.getServerSecurityLevel(target);
  }

  ns.toast(
    `${target} reached desired security level ${minSecLevel}`,
    "success",
    10000
  );
}
