const config = {
  js2svg: {
    pretty: true,
    indent: 2,
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeUselessDefs: false,
          cleanupIds: false,
          removeHiddenElems: false,
          removeUnknownsAndDefaults: false,
        },
      },
    },
  ],
};

export default config;
