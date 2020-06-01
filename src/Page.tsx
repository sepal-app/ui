import React, { ReactNode } from "react"
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from "@elastic/eui"

import { Navbar } from "./Navbar"

interface PageProps {
  pageTitle?: string
  contentTitle?: string
  children: ReactNode
}

const Page = (props: PageProps) => {
  const header = props.pageTitle && (
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiTitle size="l">
          <h1>{props.pageTitle}</h1>
        </EuiTitle>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  )

  const contentHeader = props.contentTitle && (
    <EuiPageContentHeader>
      <EuiPageContentHeaderSection>
        <EuiTitle>
          <h2>{props.contentTitle}</h2>
        </EuiTitle>
      </EuiPageContentHeaderSection>
    </EuiPageContentHeader>
  )

  return (
    <>
      <Navbar />
      <EuiPage>
        <EuiPageBody>
          {header}
          <EuiPageContent>
            {contentHeader}
            <EuiPageContentBody>{props.children}</EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

export default Page
