# decode-error-after-upgrade


## Description
This repo is a full e2e example of defect [Example of polkadot.js/issue-4557](https://github.com/polkadot-js/api/issues/4557).

Running the scenario script will do the following:
1. Run a local network containing `Polkadot@0.9.16` and `Karura@2.3.1`
2. Open a query subscription
3. Perform on-chain runtime upgrade to `Karura@2.3.3`

Upon execution of the script, the query subscription will be left open. Eventually (about 5 blocks ~1 minute later) and the errors will be printed:
```

```

## Instructions
```
yarn
yarn run:scenario
```


### Additional Commands
#### To run up the network standalone for manual testing:
```
yarn run:network:relay
```

#### To just run the test script
```
yarn run:script
```

#### To tear down the network and clear volumes:
```
yarn run:teardown:relay
```