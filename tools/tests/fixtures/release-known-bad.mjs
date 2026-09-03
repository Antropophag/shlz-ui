export const PACKAGE_ORDER = ["tokens", "icons", "styles", "behaviors"];

export const createCandidateManifest = (candidate) => ({
  ...candidate,
  digest: "unchecked",
  releaseVersion: candidate.packages[0]?.version,
  version: 1,
});

export const planCandidatePublication = ({ candidate }) =>
  candidate.packages.map(({ name, version }) => ({
    action: "publish",
    name,
    version,
  }));

export const planPromotion = ({ candidate }) =>
  candidate.packages.map(({ name, version }) => ({ name, version }));

export const planRollback = ({ target }) => ({
  mutations: target.packages.map(({ name, version }) => ({ name, version })),
});

export const validateRegistryConfiguration = () => ({ mode: "publish" });
