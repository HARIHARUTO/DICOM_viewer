window.config = {
  routerBasename: '/',
  extensions: [],
  modes: [],
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'orthancDicomWeb',
      configuration: {
        friendlyName: 'Orthanc DICOMweb',
        name: 'orthanc',
        wadoUriRoot: 'http://localhost:4000/api/dicomweb',
        qidoRoot: 'http://localhost:4000/api/dicomweb',
        wadoRoot: 'http://localhost:4000/api/dicomweb',
        qidoSupportsIncludeField: true,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        dicomUploadEnabled: false,
        singlepart: 'bulkdata,pdf,video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
      },
    },
  ],
  defaultDataSourceName: 'orthancDicomWeb',
};

