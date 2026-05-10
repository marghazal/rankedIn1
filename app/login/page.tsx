import { Nav } from "@/components/nav"
import { LoginView } from "@/components/auth/login-view"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <>
      <Nav />
      <Suspense>
        <LoginView />
      </Suspense>
    </>
  )
}
