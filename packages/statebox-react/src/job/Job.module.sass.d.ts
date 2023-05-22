declare namespace JobModuleSassNamespace {
  export interface IJobModuleSass {
    currentOperation: string;
    description: string;
    logsContainer: string;
    main: string;
    progressContainer: string;
    title: string;
    top: string;
  }
}

declare const JobModuleSassModule: JobModuleSassNamespace.IJobModuleSass & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: JobModuleSassNamespace.IJobModuleSass;
};

export = JobModuleSassModule;
