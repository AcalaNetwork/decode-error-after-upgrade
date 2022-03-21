# decode-error-after-upgrade


## Description
This repo is used for upgrade testing Acala/Karura.

Running the upgrade script will do the following:
1. Run connect to a network and open query subscription
2. Perform runtime upgrade
3. Submit extrinsic


## Instructions

Be sure to either change the `BLOB` name in upgrade_runtime.ts to be the name of the wasm file you wish to upgrade to.

```
yarn
yarn run:script
```


### Additional Commands
#### To run up the network standalone for manual testing:
You can use this repo to start some local networks for testing, either:
* `yarn run:network:karura`
* `yarn run:network:acala`

#### To tear down the network and clear volumes:
* `yarn run:teardown:karura`
* `yarn run:teardown:acala`