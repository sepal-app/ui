import React, { ComponentProps, ReactNode } from "react"
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

interface Props {
  pageTitle?: string
  contentTitle?: string
  children: ReactNode
  navbarOptions?: ComponentProps<typeof Navbar>
}

const Page: React.FC<Props> = ({ pageTitle, contentTitle, children, navbarOptions }) => {
  const header = pageTitle && (
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiTitle size="l">
          <h1>{pageTitle}</h1>
        </EuiTitle>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  )

  const contentHeader = contentTitle && (
    <EuiPageContentHeader>
      <EuiPageContentHeaderSection>
        <EuiTitle>
          <h2>{contentTitle}</h2>
        </EuiTitle>
      </EuiPageContentHeaderSection>
    </EuiPageContentHeader>
  )

  return (
    <>
      <Navbar {...navbarOptions} />
      <EuiPage className="Page--EuiPage">
        <EuiPageBody>
          {header}
          <EuiPageContent className="Page--EuiPageContent">
            {contentHeader}
            <EuiPageContentBody>{children}</EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

export default Page
