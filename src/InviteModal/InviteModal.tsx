import React, { useState } from "react"
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiText,
  EuiTextArea,
} from "@elastic/eui"
import { invite } from "../lib/organization"

interface Props {
  onClose: () => void
  orgId: number
  visible: boolean
}

export const InviteModal: React.FC<Props> = ({ onClose, orgId, visible = false }) => {
  const [emailAddresses, setEmailAddresses] = useState("")
  const sendInvitations = async () => {
    // TODO: parse the email addresses for an initial validation
    onClose && onClose()
    console.log(emailAddresses)
    const emails = emailAddresses
      .split(" ")
      .filter((s) => !!s)
      .map((s) => s.trim())
    console.log(emails)
    const resp = await invite(orgId, emails)
    if (!resp.ok) {
      // TODO: handle error
      console.log(resp)
    }
  }

  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} initialFocus="[name=popswitch]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>Invite users</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText>Email addresses of users to invite.</EuiText>
          <EuiText>
            Separate email addresses by white space or commas to invite multiple users.
          </EuiText>
          <EuiTextArea
            onChange={(e) => {
              setEmailAddresses(e.target.value)
            }}
            value={emailAddresses}
          />
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
          <EuiButton onClick={sendInvitations} fill>
            Invite
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  )
}
