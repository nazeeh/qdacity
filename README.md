QDAcity - README
================

[![build status](https://mojo-forge.cs.fau.de/kaufmann/qdacity/badges/master/build.svg)](https://mojo-forge.cs.fau.de/kaufmann/qdacity/commits/master) [![backend coverage](https://mojo-forge.cs.fau.de/kaufmann/qdacity/badges/master/coverage.svg)](https://mojo-forge.cs.fau.de/kaufmann/qdacity/commits/master)

Bill of Materials: https://mojo-forge.cs.fau.de/kaufmann/qdacity/raw/master/BoM%20-%20Bill%20of%20Materials.ods

Realtime extension
------------------

### Setup

1.  Copy `realtime-service/.env.example` to `realtime-service/.env` and adapt
    the Redis connection settings.

2.  Add the URL for your local realtime service to `war/api_config.json`:

        "sync_service": "http://localhost:8080/"

    **Don't forget the comma on the previous setting. It's JSON…**

3.  Go to `realtime-service/` and run `npm install`

### Running

1.  Go to `realtime-service/` and run `npm run start`

2.  The service will run on `http://localhost:8080`

### Deploying

For manual deployment you need the `gcloud` command line tool.  [Read
here](https://cloud.google.com/sdk/downloads?hl=de) about how to install it.

1.  Authenticate with `gcloud auth login` (Only needed once)

2.  Go to `realtime-service/` and deploy with `./deploy.sh`

For automated build in Gitlab you need to update two secret variables and then
push your code to master as usual.

1.  Like in Setup-step 1, you need to add the `sync_service` URL to the Gitlab
    CI secret variable `API_CONFIG_PRODUCTION`.

        "sync_service": "https://realtime-service-dot-[YOUR_APPSPOT_ID_HERE].appspot.com/"

    **Again: Don't forget the comma on the previous setting. It's JSON…**

2.  Copy the contents of `realtime-service/.env` to the Gitlab CI secret
    variable `RTCSVC_ENV`. You can omit the comments.

