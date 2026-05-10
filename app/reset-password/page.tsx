import { Suspense } from "react"
import { Nav } from "@/components/nav"
import { ResetPasswordView } from "@/components/auth/reset-password-view"

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <Suspense>
        <ResetPasswordView />
      </Suspense>
    </>
  )
}
