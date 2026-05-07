'use client'

import type React from 'react'
import {useActionState} from 'react'
import Link from 'next/link'
import {registerAction} from '@/serverFunctions/users'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Mountain} from 'lucide-react'

export default function RegisterPage() {
  //dit is de juiste manier
  const [actionState, formAction, isPending] = useActionState(registerAction, {success: false})

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Mountain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Join the Gustaaf Bouldering community</CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                defaultValue={actionState.submittedData?.email ?? ''}
                required
              />
              {actionState.errors?.email?.[0] && (
                <p className="text-sm text-destructive">{actionState.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="climber123"
                defaultValue={actionState.submittedData?.username ?? ''}
                required
              />
              {actionState.errors?.username?.[0] && (
                <p className="text-sm text-destructive">{actionState.errors.username[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create a password" required />
              {actionState.errors?.password?.[0] && (
                <p className="text-sm text-destructive">{actionState.errors.password[0]}</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                placeholder="Confirm your password"
                required
              />
              {actionState.errors?.passwordConfirmation?.[0] && (
                <p className="text-sm text-destructive">{actionState.errors.passwordConfirmation[0]}</p>
              )}
            </div>

            {/* globale errors (wrapper gebruikt vaak errors.errors) */}
            {actionState.errors?.errors?.[0] && (
              <p className="text-sm text-destructive">{actionState.errors.errors[0]}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Sign Up'}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
