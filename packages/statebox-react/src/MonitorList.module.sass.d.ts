declare namespace MonitorListModuleSassNamespace {
  export interface IMonitorListModuleSass {
    list: string;
    main: string;
    title: string;
  }
}

declare const MonitorListModuleSassModule: MonitorListModuleSassNamespace.IMonitorListModuleSass & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MonitorListModuleSassNamespace.IMonitorListModuleSass;
};

export = MonitorListModuleSassModule;
