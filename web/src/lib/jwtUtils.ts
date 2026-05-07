import 'server-only'
import JWT from 'jsonwebtoken'
import type {Profile, SessionWithProfile} from '@/models/users'
import type {Role} from '@/generated/prisma/enums'
import {createPrivateKey} from 'crypto'
import type {KeyObject} from 'crypto'

const {PUBLIC_KEY, PRIVATE_KEY, ALLOW_INSECURE_KEY_SIZES} = process.env
const TOKEN_EXPIRATION = '24h'

/*
  Zorg dat keys uit env (vaak een base64-body zonder PEM-headers) worden omgevormd
  naar geldige PEM-strings. Als de key al PEM bevat, normaliseer newline-escapes en return
*/
function extractBase64(body: string) {
  // keep the longest run of base64-like chars (ignore stray leading characters like 'n' from double-escaping)
  const runs = body.match(/[A-Za-z0-9+/=]{32,}/g)
  if (runs && runs.length) {
    // choose the longest run
    return runs.reduce((a, b) => (b.length > a.length ? b : a), runs[0])
  }
  // fallback to stripping non-base64 then return what's left
  return body.replace(/[^A-Za-z0-9+/=]/g, '')
}

function formatPemKey(key: string | undefined, type: 'PRIVATE' | 'PUBLIC') {
  if (!key) throw new Error(`Missing ${type} key in environment`)

  // Trim overall leading/trailing whitespace
  let k = key.trim()

  // If value contains escaped newlines (e.g. stored as a single-line with \n) convert sequences like \\\n  // This replaces one-or-more backslashes followed by 'n' into a single newline, handling both '\n' and '\\n' etc.
  if (k.includes('\\n') || k.includes('\\\\n')) k = k.replace(/\\+n/g, '\n')

  // Remove any literal backslash characters that can appear when env values are double-escaped
  // e.g. "\\n" or stray "\\" sequences. Base64 does not use backslash so it's safe to remove.
  k = k.replace(/\\/g, '')

  // Remove any leading indentation/extra spaces on each line
  k = k
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')

  // If it already contains PEM headers, extract and normalize the body to proper 64-char lines
  const headerMatch = k.match(/(-----BEGIN [A-Z0-9 ]+-----)/)
  const footerMatch = k.match(/(-----END [A-Z0-9 ]+-----)/)
  if (headerMatch && footerMatch) {
    const header = headerMatch[1]
    const footer = footerMatch[1]
    let body = k.slice(k.indexOf(header) + header.length, k.indexOf(footer)).replace(/\s+/g, '')
    body = extractBase64(body)
    const chunks = body.match(/.{1,64}/g) || [body]
    return `${header}\n${chunks.join('\n')}\n${footer}`
  }

  // Otherwise assume the value is a bare base64 body (maybe single-line). Extract base64 run and wrap.
  const rawBody = k.replace(/\s+/g, '')
  const body = extractBase64(rawBody)
  const chunks = body.match(/.{1,64}/g) || [body]
  const header = type === 'PRIVATE' ? '-----BEGIN PRIVATE KEY-----' : '-----BEGIN PUBLIC KEY-----'
  const footer = type === 'PRIVATE' ? '-----END PRIVATE KEY-----' : '-----END PUBLIC KEY-----'
  return `${header}\n${chunks.join('\n')}\n${footer}`
}

const PUBLIC_KEY_DECODED = formatPemKey(PUBLIC_KEY, 'PUBLIC')
const PRIVATE_KEY_DECODED = formatPemKey(PRIVATE_KEY, 'PRIVATE')

function getPrivateKeyObject(privatePem: string): {keyObj: KeyObject; allowInsecure: boolean} {
  try {
    const keyObj = createPrivateKey({key: privatePem})
    // Node provides asymmetricKeyDetails.modulusLength for RSA on supported versions
    // Use a safe typed access to avoid `any` and ESLint errors about ts-ignore
    const asymmetricDetails = (keyObj as unknown as {asymmetricKeyDetails?: {modulusLength?: number}})
      .asymmetricKeyDetails
    const modulusLength = asymmetricDetails?.modulusLength

    if (modulusLength !== undefined && modulusLength < 2048) {
      const allow = ALLOW_INSECURE_KEY_SIZES === 'true'
      if (!allow) {
        throw new Error(
          `Private key modulus is ${modulusLength} bits which is smaller than the required 2048 bits for RS256.` +
            `\nGenerate a 2048+ RSA keypair (recommended) or set ALLOW_INSECURE_KEY_SIZES=true to bypass this check (not recommended in production).`,
        )
      }
      return {keyObj, allowInsecure: true}
    }

    // If modulusLength is not available or >=2048, proceed normally
    return {keyObj, allowInsecure: false}
  } catch (err) {
    // If createPrivateKey fails for some reason, rethrow a helpful error
    throw new Error(`Failed to parse PRIVATE_KEY for signing: ${(err as Error).message}`)
  }
}

export interface TokenBody {
  email: string
  id: string
  role: Role
  username: string
  iat: number
  exp: number
  iss: string
  sub: string
}

export interface StatefulJwtTokenBody extends TokenBody {
  sessionId: string
}

export const validateJwtToken = (token: string): TokenBody | undefined => {
  try {
    return JWT.verify(token, PUBLIC_KEY_DECODED) as unknown as TokenBody
  } catch (_e) {
    return undefined
  }
}

export const validateStatefulJwtToken = (token: string): StatefulJwtTokenBody | undefined => {
  try {
    return JWT.verify(token, PUBLIC_KEY_DECODED) as unknown as StatefulJwtTokenBody
  } catch (_e) {
    return undefined
  }
}

export const createJwtToken = (user: Profile) => {
  const {keyObj, allowInsecure} = getPrivateKeyObject(PRIVATE_KEY_DECODED)
  return JWT.sign(
    {
      email: user.email,
      id: user.id,
      username: user.username,
      role: user.role,
    },
    keyObj,
    {
      algorithm: 'RS256',
      expiresIn: TOKEN_EXPIRATION,
      subject: user.email,
      issuer: 'contacts-app',
      allowInsecureKeySizes: allowInsecure,
    },
  )
}

export const createStatefulJwtToken = (session: SessionWithProfile) => {
  const {keyObj, allowInsecure} = getPrivateKeyObject(PRIVATE_KEY_DECODED)
  return JWT.sign(
    {
      email: session.user.email,
      id: session.user.id,
      username: session.user.username,
      role: session.user.role,
      sessionId: session.id,
    },
    keyObj,
    {
      algorithm: 'RS256',
      expiresIn: TOKEN_EXPIRATION,
      subject: session.user.email,
      issuer: 'contacts-app',
      allowInsecureKeySizes: allowInsecure,
    },
  )
}
