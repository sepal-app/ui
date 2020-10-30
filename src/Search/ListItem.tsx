import React, { ComponentProps } from "react"
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTextColor } from "@elastic/eui"

type Props = {
  isActive: boolean
  onClick: () => void
  subtitle?: string
  title: string
} // & Pick<ComponentProps<typeof EuiListGroupItem>, "isActive" | "onClick">

export const ListItem: React.FC<Props> = ({
  isActive,
  onClick,
  subtitle = "",
  title,
  ...props
}) => (
  <>
    <EuiFlexGroup
      direction="column"
      className="Search--ListItem"
      onClick={onClick}
      {...props}
    >
      <EuiFlexItem>
        <EuiText>
          <EuiTextColor color="default">
            <h5>{title}</h5>
          </EuiTextColor>
          <EuiTextColor color="subdued">
            <p>
              <small> {subtitle}</small>
            </p>
          </EuiTextColor>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </>
)
