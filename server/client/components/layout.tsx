import Link from "next/link"
import React, { Suspense } from "react"
import { Container, Menu } from 'semantic-ui-react'
import { signIn } from 'next-auth/react'
import { mgr } from "../lib/oidc"

export default function Layout ({ children }) {
  return <Container style={{ width: '75%' }}>
      {/* @ts-ignore */}
      <Menu style={{ marginTop: 10 }}>
        {/* @ts-ignore */}
        <Menu.Item name='home'>
          <strong>Seedo</strong>
        </Menu.Item>

        <Link href='/'>
        {/* @ts-ignore */}
        <Menu.Item name='summary'>
          Summary
        </Menu.Item>
        </Link>

        <Suspense>
        {/* @ts-ignore */}
        <Menu.Item name='about' onClick={() => mgr(window.localStorage).signinRedirect()}>
          Login
        </Menu.Item>
        </Suspense>

      </Menu>
    <main>{children}</main>
  </Container>
}