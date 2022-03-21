require('dotenv').config()
import {
  connect,
  executeRuntimeUpgrade,
  sendExtrinsic,
  waitForNextBlock,
} from './helpers-functions'
import { createTestPairs } from '@polkadot/keyring/testingPairs'


async function main() {
  // Setup
  const BLOB = "karura_upgrade_v241.wasm"
  const api = await connect()
  const testingPairs = createTestPairs()
  const sudoSigner = testingPairs.alice
  const token = { Token: 'KSM' }

  // Open Query Subscription
  await printDetails(api)
  const unsub = await api.query.tokens.accounts(sudoSigner.address, token, ({ free }) => {
    console.log(`\tToken ${token.Token} free balance is ${free}`)
  })

  const setBalTxn = api.tx.currencies.updateBalance(sudoSigner.address, token, 13_337_000_000_000)
  const sudoSetBalTxn = api.tx.sudo.sudo(setBalTxn)
  await sendExtrinsic(sudoSigner, sudoSetBalTxn, true)

  // Initiate upgrade

  // Upgrade path: v2.4.0 -> v2.4.1
  await executeRuntimeUpgrade(api, testingPairs.alice, BLOB)
  await waitForNextBlock(api, 3, 3000)

  // Show new state
  await printDetails(api)
  const setBalTxn2 = api.tx.currencies.updateBalance(sudoSigner.address, token, 13_337_000_000_000)
  const sudoSetBalTxn2 = api.tx.sudo.sudo(setBalTxn2)
  await sendExtrinsic(sudoSigner, sudoSetBalTxn2, true)
  

  // Tidy up
  // await unsub()
  await api.disconnect()
}

async function printDetails(api) {
  console.log('===========================================================')
  console.log(`API extrinsic Version is: ${api.extrinsicVersion.toString()}`)
  console.log(`Runtime Version is: ${api.runtimeVersion.toString()}`)
}

main()
