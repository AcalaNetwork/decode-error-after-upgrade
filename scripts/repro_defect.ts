import { connect, sendExtrinsic } from '../scripts/helpers-functions'
import { createTestPairs } from '@polkadot/keyring/testingPairs'
const fs = require('fs')

async function main() {
  // Setup
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
  console.log('===========================================================')
  const code = fs.readFileSync('./blob/upgrade.wasm').toString('hex')
  console.log(`Upgrading from ${testingPairs.alice.address}, ${code.length / 2} bytes`)
  const proposal = api.tx.system.setCode(`0x${code}`)
  const upgradeTxn = api.tx.sudo.sudoUncheckedWeight(proposal, 1)
  await sendExtrinsic(sudoSigner, upgradeTxn, true)

  // Show new state
  const setBalTxn2 = api.tx.currencies.updateBalance(sudoSigner.address, token, 13_337_000_000_000)
  const sudoSetBalTxn2 = api.tx.sudo.sudo(setBalTxn2)
  await sendExtrinsic(sudoSigner, sudoSetBalTxn2, true)

  // Tidy up
  // await unsub()
  // await api.disconnect()
}

async function printDetails(api) {
  console.log('===========================================================')
  console.log(`API extrinsic Version is: ${api.extrinsicVersion.toString()}`)
  console.log(`Runtime Version is: ${api.runtimeVersion.toString()}`)
}

main()
