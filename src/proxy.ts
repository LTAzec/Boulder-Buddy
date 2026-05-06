import {withProxy} from '@/proxy/withProxy'
import {loggingProxy} from '@/proxy/loggingProxy'
import {corsProxy} from '@/proxy/corsProxy'
import {redirectProxy} from '@/proxy/redirectProxy'
import {sessionManagementProxy} from '@/proxy/sessionManagementProxy'

export const proxy = withProxy(loggingProxy, redirectProxy, sessionManagementProxy, corsProxy)

// ✅ Proxy/middleware draait NIET op uploads (multipart), anders krijg je body-lock / 10MB issues
export const config = {
  matcher: ['/((?!api/uploads).*)'],
}
