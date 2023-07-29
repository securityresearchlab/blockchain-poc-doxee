/** @type {import('next').NextConfig} */

module.exports = {
    reactStrictMode: true,
    cssModules: true,
    experimental: {
      appDir: true,
      externalDir: true,
    },
    webpack(config, options) {
      config.module.rules.forEach((rule) => {
        /** I've added this module to enable
         *  css modules camelCase convention  */
        rule.oneOf?.forEach((one) => {
          Array.isArray(one.use) &&
            one.use.forEach((loader) => {
              if (loader.loader?.includes("css-loader") && !loader.loader?.includes("postcss-loader")) {
                if (loader?.options?.modules) {
                  loader.options.modules.exportLocalsConvention = "camelCase";
                }
              }
            });
        });
      });
      return config;
    },
  };
  