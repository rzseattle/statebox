declare namespace MonitorModuleSassNamespace {
  export interface IMonitorModuleSass {
    main: string;
    title: string;
  }
}

declare const MonitorModuleSassModule: MonitorModuleSassNamespace.IMonitorModuleSass & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MonitorModuleSassNamespace.IMonitorModuleSass;
};

export = MonitorModuleSassModule;
