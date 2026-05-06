import {getUserByEmail} from '@/dal/users'
import {getSalt, hashOptions, verifyPassword} from '@/lib/passwordUtils'
import {ok, unauthorized} from '@/lib/routeResponses'
import {createJwtToken} from '@/lib/jwtUtils'
import {publicApiRoute} from '@/lib/apiRoute'
import {signInSchema} from '@/schemas/user.schema'

export const POST = publicApiRoute({
  routeFn: async ({data, logger}) => {
    const user = await getUserByEmail(data.email)
    const timingSafePassword = `${hashOptions.iterations}$${hashOptions.keyLength}$preventTimingBasedAttacks123$${getSalt()}`
    const isValidPassword = verifyPassword(user?.password ?? timingSafePassword, data.password)

    if (!isValidPassword) {
      logger.warn(`Failed sign in attempt for ${data.email}.`)
      return unauthorized()
    }

    logger.info(`Successful authentication request for ${user!.id}`)

    const token = createJwtToken(user!)

    return ok({token})
  },
  schema: signInSchema,
})
