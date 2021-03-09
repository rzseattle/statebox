declare namespace JobListModuleSassNamespace {
    export interface IJobListModuleSass {
        main: string;
    }
}

declare const JobListModuleSassModule: JobListModuleSassNamespace.IJobListModuleSass & {
    /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
    locals: JobListModuleSassNamespace.IJobListModuleSass;
};

export = JobListModuleSassModule;
