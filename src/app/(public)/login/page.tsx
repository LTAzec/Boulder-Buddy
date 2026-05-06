'use client'

import {useActionState} from 'react'
import {signInAction} from '@/serverFunctions/users'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Mountain} from 'lucide-react'

export default function LoginPage() {
  const [actionResult, signIn] = useActionState(signInAction, {success: false})

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Mountain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Login to your Gustaaf Bouldering account</CardDescription>
        </CardHeader>

        <form action={signIn} className="space-y-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>

            {actionResult?.errors?.errors && (
              <p className="text-sm text-destructive text-center">{actionResult.errors.errors[0]}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 ">
            <Button type="submit" className="w-full">
              Login
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
