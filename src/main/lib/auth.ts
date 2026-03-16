import { NextFunction, Request, Response } from 'express'

import { getStorageValue, setStorageValue } from './storage.js'
import { hash, random } from './utils.js'

interface Key {
  name: string
  hash: string
}

export function getKeys() {
  const keys = getStorageValue('keys', true) as string | undefined
  if (!keys) return []

  const entries = keys.split(',').map(k => k.trim())

  return entries.map(e => {
    const [name, hash] = e.split(':')
    return { name, hash }
  })
}

export async function saveKeys(keys: Key[]) {
  const entries = keys.map(k => `${k.name}:${k.hash}`)
  await setStorageValue('keys', entries.join(','), true)
}

export async function createKey(name: string) {
  const key = random(32)

  const keys = getKeys()
  keys.push({
    name,
    hash: hash(key)
  })

  await saveKeys(keys)

  return key
}

export async function deleteKey(hash: string) {
  const keys = getKeys()
  const filtered = keys.filter(k => k.hash !== hash)
  await saveKeys(filtered)
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (getStorageValue('disableAuth') === true) return next()

  const header = req.headers['authorization']
  const query = req.query.key as string | undefined
  const key = header || query
  if (!key) return res.status(401).send('Unauthorized')

  const keys = getKeys()
  if (!keys.some(k => k.hash === hash(key)))
    return res.status(401).send('Unauthorized')

  return next()
}
