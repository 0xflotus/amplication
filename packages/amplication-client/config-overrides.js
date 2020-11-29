/**
 * Override Create React App Webpack configuration
 * This file is being used by react-app-rewired
 * @see https://github.com/timarney/react-app-rewired
 */

const path = require("path");
const { set } = require("lodash");

module.exports = function override(config, env) {
  /**
   * Force Webpack to resolve react to the version in node_modules top level
   * This has to be done because, correct to November 2020, when using Lerna
   * with npm Webpack sees the react package in amplication-design-system as a
   * different package (even if versions match)
   * @see https://stackoverflow.com/a/31170775/5798553
   */
  aliasDependencyToTopLevel(config, "react");
  /**
   * Force Webpack to resolve @rmwc/provider to the version in node_modules top
   * level This has to be done because, correct to November 2020, when using
   * Lerna with npm Webpack sees the @rmwc/provider package in
   * amplication-design-system as a different package (even if versions match)
   * The package must be deduplicated for the provider to affect all the
   * components correctly
   */
  aliasDependencyToTopLevel(config, "@rmwc/provider");
  return config;
};

function aliasDependencyToTopLevel(config, dependency) {
  set(
    config,
    ["resolve", "alias", dependency],
    path.resolve(`./node_modules/${dependency}`)
  );
}
