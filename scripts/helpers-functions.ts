import { WsProvider, ApiPromise } from '@polkadot/api'
import { options } from '@acala-network/api'
const fs = require('fs')

export async function connect() {
  const wsProvider = new WsProvider('ws://127.0.0.1:9944')
  const api = await ApiPromise.create(options({ provider: wsProvider }))
  await api.isReady
  return api
}

async function blockWatcher(block, unsub, resolve, reject, verbose) {
  switch (true) {
    case block.status.isReady:
      if (verbose) console.log('\tBlock is ready')
      break
    case block.status.isInBlock:
      if (verbose) console.log(`\tTransaction included at blockHash ${block.status.asInBlock}`)
      break
    case block.status.isFinalized:
      if (verbose) console.log(`\tTransaction finalized at blockHash ${block.status.asFinalized}`)
      unsub()
      resolve(block.status.asFinalized)
      break
    case block.status.isDropped:
      if (verbose) console.log('\tBlock is dropped')
      unsub()
      reject('Block has been dropped')
      break
    default:
      break
  }
}

export async function sendExtrinsic(signer, txn, verbose) {
  let txn_hash
  let promise = new Promise(async (resolve, reject) => {
    const unsub = await txn.signAndSend(signer, { nonce: -1 }, (block) => {
      blockWatcher(block, unsub, resolve, reject, verbose)
    })
  })

  await promise
    .then((message) => {
      if (verbose) console.log('\tTransaction complete.')
      txn_hash = message
    })
    .catch((message) => {
      if (verbose) console.error(`\tBlock Error: ${message}`)
      throw new Error('Sending transaction failed.')
    })
  return txn_hash
}

export async function waitForNextBlock(
  api: ApiPromise,
  offset: number = 0,
  refresh: number = 1000,
) {
  const initialHeight = Number((await api.rpc.chain.getHeader())['number'])
  let blockHeight: number

  do {
    blockHeight = Number((await api.rpc.chain.getHeader())['number'])
    setTimeout(() => {}, refresh)
  } while (blockHeight <= initialHeight + offset)
}

export async function executeRuntimeUpgrade(api: ApiPromise, signer, wasmName) {
  console.log('===========================================================')
  const code = fs.readFileSync(`./blobs/${wasmName}`).toString('hex')
  console.log(`Upgrading from ${signer.address}, ${code.length / 2} bytes`)
  const proposal = api.tx.system.setCode(`0x${code}`)
  const upgradeTxn = api.tx.sudo.sudoUncheckedWeight(proposal, 1)
  await sendExtrinsic(signer, upgradeTxn, true)
}
