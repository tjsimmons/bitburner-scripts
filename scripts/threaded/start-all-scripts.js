/** @param {import("../..").NS} ns */
export async function main(ns) {
  const host = ns.args[0];
  const target = ns.args[1];
  const minWeakenPad = ns.args[2];
  const growThreshholdPercent = ns.args[3];
  const hackThresholdPercent = ns.args[4];

  if (host === undefined) {
    ns.toast("Host must be passed as an argument", "error", 3000);
    return;
  }

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (minWeakenPad === undefined) {
    ns.toast("minWeakenPad must be passed as an argument", "error", 3000);
    return;
  }

  if (growThreshholdPercent === undefined) {
    ns.toast(
      "growThreshholdPercent must be passed as an argument",
      "error",
      3000
    );
    return;
  }

  if (hackThresholdPercent === undefined) {
    ns.toast(
      "hackThresholdPercent must be passed as an argument",
      "error",
      3000
    );
    return;
  }

  const mainPath = "/scripts/threaded/main.js";

  // copy everything over to the server
  const paths = [
    "/scripts/weaken.js",
    "/scripts/grow.js",
    "/scripts/hack.js",
    mainPath,
  ];

  paths.map((file) => ns.scp(file, host));

  ns.exec(
    mainPath,
    host,
    1,
    target,
    minWeakenPad,
    growThreshholdPercent,
    hackThresholdPercent
  );
}
