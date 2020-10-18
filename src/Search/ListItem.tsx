import React, { ComponentProps } from "react"
import { EuiListGroupItem, EuiText } from "@elastic/eui"

type Props = {
  subtitle?: string
  title: string
} & Pick<ComponentProps<typeof EuiListGroupItem>, "isActive" | "onClick">

export const ListItem: React.FC<Props> = ({ subtitle = "", title, ...props }) => (
  <EuiListGroupItem
    label={
      <EuiText>
        <h5>{title}</h5>
        <p>
          <small>{subtitle}</small>
        </p>
      </EuiText>
    }
    {...props}
  />
)
// <div>
//   <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
//     {false && (
//       <EuiFlexItem grow={false}>
//         <EuiIcon type="logoWebhook" size="m" />
//       </EuiFlexItem>
//     )}
//
//     <EuiFlexItem>
//       <EuiTitle size="s" className="euiAccordionForm__title">
//         <h4>{title}</h4>
//       </EuiTitle>
//     </EuiFlexItem>
//   </EuiFlexGroup>
//
//   <EuiText size="s">
//     <p>
//       <EuiTextColor color="subdued">{subtitle}</EuiTextColor>
//     </p>
//   </EuiText>
// </div>
// )
