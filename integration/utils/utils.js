/* global network */
const crypto = require('crypto')
const { ethers } = require('hardhat')
const BigNumber = ethers.BigNumber
const circomlib = require('circomlibjs');

const FIELD_SIZE = BigNumber.from(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
)

async function poseidonHash (items) {
  const poseidon = await circomlib.buildPoseidon();
  return poseidon(items)
}
async function poseidonHash2 (a, b) {
  return await poseidonHash([a, b])
}

/** Generate random number of specified byte length */
const randomBN = (nbytes = 31) => BigNumber.from(crypto.randomBytes(nbytes))

function getExtDataHash({
  recipient,
  extAmount,
  encryptedOutput1,
  encryptedOutput2
}) {
  const abi = new ethers.utils.AbiCoder()

  const encodedData = abi.encode(
    [
      'tuple(address recipient,int256 extAmount,bytes encryptedOutput1,bytes encryptedOutput2)',
    ],
    [
      {
        recipient: toFixedHex(recipient, 20),
        extAmount: toFixedHex(extAmount),
        encryptedOutput1: encryptedOutput1,
        encryptedOutput2: encryptedOutput2,
      },
    ],
  )
  const hash = ethers.utils.keccak256(encodedData)
  return BigNumber.from(hash).mod(FIELD_SIZE)
}

/** BigNumber to hex string of specified length */
function toFixedHex(number, length = 32) {
  let result =
    '0x' +
    (number instanceof Buffer
      ? number.toString('hex')
      : BigNumber.from(number).toHexString().replace('0x', '')
    ).padStart(length * 2, '0')
  if (result.indexOf('-') > -1) {
    result = '-' + result.replace('-', '')
  }
  return result
}

/** Convert value into buffer of specified byte length */
const toBuffer = (value, length) =>
  Buffer.from(
    BigNumber.from(value)
      .toHexString()
      .slice(2)
      .padStart(length * 2, '0'),
    'hex',
  )

function shuffle(array) {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

module.exports = {
  FIELD_SIZE,
  randomBN,
  toFixedHex,
  toBuffer,
  poseidonHash,
  poseidonHash2,
  getExtDataHash,
  shuffle
}
