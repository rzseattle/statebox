

module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    babel: async (options) => ({
        ...options,
        presets: [
            ...options.presets,
            // [
            //     "@babel/preset-env",
            //     {
            //         useBuiltIns: "usage", // "usage" | "entry" | false, defaults to false.
            //         corejs: "3.0.0",
            //         targets: {
            //             esmodules: true,
            //             ie: "11",
            //         },
            //     },
            // ],
        ],
    }),
};
